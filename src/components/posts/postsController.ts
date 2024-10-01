import { Router, Request, Response } from 'express';
import { HTTP_STATUSES, RequestWbody, RequestWparams, RequestWparamsAndBody, RequestWquery } from "../../utils/types";
import { PostApiRequestModel, PostApiResponseModel } from "./models/PostApiModel";
import { postsRepository } from "./postsRepository";
import createEditPostValidationChains from "./middlewares/createEditPostValidationChains";
import { authMiddleware } from "../../middlewares/authMiddleware";
import postUrlParamValidation from "./middlewares/postUrlParamValidation";
import postQueryValidation from "./middlewares/postQueryValidation";
import { PostQueryGetModel } from "./models/PostQueryGetModel";

export const postsRouter = Router();

const postsController = {
    async getPosts(req: RequestWquery<PostQueryGetModel>, res: Response<PostApiResponseModel[]>){
        const { pageNumber, pageSize, sortBy, sortDirection } = req.query
        const posts = await postsRepository.getPosts(
            Number(pageNumber),
            Number(pageSize),
            sortBy,
            sortDirection
        );

        const apiModelPosts = posts.map(postsRepository.fromDbModelToResponseModel);

        return res.json(apiModelPosts);
    },
    async getPostById(req: RequestWparams<{ id: string }>, res: Response<PostApiResponseModel>){
        const { id } = req.params;
        const foundPost = await postsRepository.getPostById(id);

        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        const apiModelPost = postsRepository.fromDbModelToResponseModel(foundPost);

        return res.json(apiModelPost);
    },
    async createPost(req: RequestWbody<PostApiRequestModel>, res: Response<PostApiResponseModel>){
        const body = req.body;
        const post = await postsRepository.createPost(body);

        const apiModelPost = postsRepository.fromDbModelToResponseModel(post);

        return res.status(HTTP_STATUSES.CREATED_201).json(apiModelPost);
    },
    async editPost (req: RequestWparamsAndBody<{ id: string }, PostApiRequestModel>, res: Response){
        const foundPost = await postsRepository.getPostById(req.params.id);
        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        const updatedPostFromBody = req.body;
        const newPost = { ...foundPost, ...updatedPostFromBody  };

        await postsRepository.updatePostById(newPost);

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    },
    async deletePostById(req: RequestWparams<{ id: string }>, res: Response){
        const foundPost = await postsRepository.getPostById(req.params.id);
        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        await postsRepository.deletePostById(foundPost._id.toString());

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }
}

postsRouter.get('/', ...postQueryValidation, postsController.getPosts)
postsRouter.get('/:id', ...postUrlParamValidation, postsController.getPostById)
postsRouter.post('/', authMiddleware, ...createEditPostValidationChains, postsController.createPost)
postsRouter.put('/:id', ...postUrlParamValidation, authMiddleware,  ...createEditPostValidationChains, postsController.editPost)
postsRouter.delete('/:id', ...postUrlParamValidation, authMiddleware, postsController.deletePostById)
