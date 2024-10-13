import { Router, Request, Response } from 'express';
import { HTTP_STATUSES, RequestWbody, RequestWparams, RequestWparamsAndBody, RequestWquery } from "../../utils/types";
import { PostApiRequestModel, PostApiResponseModel, PostsApiResponseModel } from "./models/PostApiModel";
import createEditPostValidationChains from "./middlewares/createEditPostValidationChains";
import { authMiddleware } from "../../middlewares/authMiddleware";
import postUrlParamValidation from "./middlewares/postUrlParamValidation";
import postQueryValidation from "./middlewares/postQueryValidation";
import { PostQueryGetModel } from "./models/PostQueryGetModel";
import { postsService } from "./postsService";

export const postsRouter = Router();

const postsController = {
    async getPosts(req: RequestWquery<PostQueryGetModel>, res: Response<PostsApiResponseModel>){
        const { pageNumber, pageSize, sortBy, sortDirection } = req.query

        const result = await postsService.getPosts(
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
        const foundPost = await postsService.getPostById(id);

        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        return res.json(foundPost);
    },
    async createPost(req: RequestWbody<PostApiRequestModel>, res: Response<PostApiResponseModel>){
        const post = await postsService.createPost(req.body);

        return res.status(HTTP_STATUSES.CREATED_201).json(post);
    },
    async editPost (req: RequestWparamsAndBody<{ id: string }, PostApiRequestModel>, res: Response){
        const foundPost = await postsService.getPostById(req.params.id);
        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        const newPost = { ...foundPost, ...req.body  };

        await postsService.updatePost(newPost);

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    },
    async deletePostById(req: RequestWparams<{ id: string }>, res: Response){
        const foundPost = await postsService.getPostById(req.params.id);
        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        await postsService.deletePostById(foundPost.id);

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }
}

postsRouter.get('/', ...postQueryValidation, postsController.getPosts)
postsRouter.get('/:id', ...postUrlParamValidation, postsController.getPostById)
postsRouter.post('/', authMiddleware, ...createEditPostValidationChains, postsController.createPost)
postsRouter.put('/:id', ...postUrlParamValidation, authMiddleware,  ...createEditPostValidationChains, postsController.editPost)
postsRouter.delete('/:id', ...postUrlParamValidation, authMiddleware, postsController.deletePostById)
