import {Router, Response, NextFunction} from 'express';
import { HTTP_STATUSES, RequestWbody, RequestWparams, RequestWparamsAndBody, RequestWquery } from "../../utils/types";
import { PostApiRequestModel, PostApiResponseModel, PostsApiResponseModel } from "./models/PostApiModel";
import createEditPostValidationChains from "./middlewares/createEditPostValidationChains";
import { authMiddleware } from "../../middlewares/authMiddleware";
import postUrlParamValidation from "./middlewares/postUrlParamValidation";
import postQueryValidation from "./middlewares/postQueryValidation";
import { PostQueryGetModel } from "./models/PostQueryGetModel";
import { postsService } from "./postsService";
import {postsQueryRepository} from "./repositories/postsQueryRepository";
import {CommentApiRequestModel, CommentApiResponseModel} from "../comments/models/CommentApiModel";
import {jwtAuthMiddleware} from "../../middlewares/jwtAuthMiddleware";
import {commentsService} from "../comments/commentsService";
import {commentsQueryRepository} from "../comments/repositories/commentsQueryRepository";

export const postsRouter = Router();

const postsController = {
    async getPosts(req: RequestWquery<PostQueryGetModel>, res: Response<PostsApiResponseModel>){
        const { pageNumber, pageSize, sortBy, sortDirection } = req.query

        const result = await postsQueryRepository.getPosts(
            '',
            Number(pageNumber) || 1,
            Number(pageSize) || 10,
            sortBy,
            sortDirection
        )

        return res.json(result);
    },
    async getPostById(req: RequestWparams<{ id: string }>, res: Response<PostApiResponseModel>){
        const { id } = req.params;
        const foundPost = await postsQueryRepository.getPostById(id);

        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        return res.json(foundPost);
    },
    async createPost(req: RequestWbody<PostApiRequestModel>, res: Response<PostApiResponseModel>, next: NextFunction){
        try {
            const postId = await postsService.createPost(req.body);
            const post = await postsQueryRepository.getPostById(postId);

            if (!post) {
                return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            }

            return res.status(HTTP_STATUSES.CREATED_201).json(post);
        } catch (err: any) {
            return next(err)
        }
    },
    async editPost (req: RequestWparamsAndBody<{ id: string }, PostApiRequestModel>, res: Response, next: NextFunction){
        try {
            const result = await postsService.updatePost(req.params.id, req.body);

            if (!result) {
                return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            }

            return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } catch (err: any) {
            return next(err)
        }
    },
    async deletePostById(req: RequestWparams<{ id: string }>, res: Response, next: NextFunction){
        try {
            const result = await postsService.deletePostById(req.params.id);

            if (!result) {
                return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            }

            return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } catch (err) {
            return next(err)
        }
    },

    // TODO или ложить етот метод в контроллер коментов?
    async createCommentForPost(req: RequestWparamsAndBody<{ id: string }, CommentApiRequestModel>, res: Response<CommentApiResponseModel>, next: NextFunction) {
        const { id: postId } = req.params
        try {
            const commentId = await commentsService.createComment(postId, req.body, req.user)

            const comment = await commentsQueryRepository.getCommentById(commentId)

            if (!comment) {
                return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            }

            return res.status(HTTP_STATUSES.CREATED_201).json(comment)
        } catch (err) {
            return next(err)
        }
    }
}

postsRouter.post('/:id/comments', jwtAuthMiddleware, postsController.createCommentForPost)

postsRouter.get('/', ...postQueryValidation, postsController.getPosts)
postsRouter.get('/:id', ...postUrlParamValidation, postsController.getPostById)
postsRouter.post('/', authMiddleware, ...createEditPostValidationChains, postsController.createPost)
postsRouter.put('/:id', ...postUrlParamValidation, authMiddleware,  ...createEditPostValidationChains, postsController.editPost)
postsRouter.delete('/:id', ...postUrlParamValidation, authMiddleware, postsController.deletePostById)
