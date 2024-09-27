import { Router, Request, Response } from 'express';
import { HTTP_STATUSES, RequestWbody, RequestWparams, RequestWparamsAndBody } from "../utils/types";
import { PostInputModel, PostViewModel } from "../models/PostModel";
import { postsRepository } from "../repositories/postsRepository";
import createEditPostValidationChains from "../middlewares/validation/createEditPostValidationChains";
import { authMiddleware } from "../middlewares/authMiddleware";

export const postsRouter = Router();

const postsController = {
    async getPosts(req: Request, res: Response<PostViewModel[]>){
        const posts = await postsRepository.getPosts();
        return res.json(posts);
    },
    async getPostById(req: RequestWparams<{ id: string }>, res: Response<PostViewModel>){
        const { id } = req.params;
        const foundPost = await postsRepository.getPostById(id);

        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        return res.json(foundPost);
    },
    async createPost(req: RequestWbody<PostInputModel>, res: Response<PostViewModel>){
        const body = req.body;
        const post = await postsRepository.createPost(body);

        return res.status(HTTP_STATUSES.CREATED_201).json(post);
    },
    async editPost (req: RequestWparamsAndBody<{ id: string }, PostInputModel>, res: Response){
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

        await postsRepository.deletePostById(foundPost.id);

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }
}

postsRouter.get('/', postsController.getPosts)
postsRouter.get('/:id', postsController.getPostById)
postsRouter.post('/', authMiddleware, ...createEditPostValidationChains, postsController.createPost)
postsRouter.put('/:id', authMiddleware,  ...createEditPostValidationChains, postsController.editPost)
postsRouter.delete('/:id', authMiddleware, postsController.deletePostById)
