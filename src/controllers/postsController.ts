import { Router, Request, Response } from 'express';
import { HTTP_STATUSES, RequestWbody, RequestWparams, RequestWparamsAndBody } from "../utils/types";
import { PostInputModel, PostViewModel } from "../models/PostModel";
import { postsRepository } from "../repositories/postsRepository";
import createEditPostValidationChains from "../middlewares/validation/createEditPostValidationChains";

export const postsController = Router();

postsController.get('/', async (req: Request, res: Response) => {
    const posts = postsRepository.getPosts();
    return res.json(posts);
})

postsController.get('/:id', async (req: RequestWparams<{ id: string }>, res: Response<PostViewModel>) => {
    const { id } = req.params;
    const foundPost = postsRepository.getPostById(id);

    if (!foundPost) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }

    return res.json(foundPost);
})

postsController.post('/', ...createEditPostValidationChains, async (req: RequestWbody<PostInputModel>, res: Response<PostViewModel>) => {
    const body = req.body;
    const post = postsRepository.createPost(body);

    return res.status(HTTP_STATUSES.CREATED_201).json(post);
})

postsController.put('/:id', ...createEditPostValidationChains, async (req: RequestWparamsAndBody<{ id: string }, PostInputModel>, res: Response) => {
    const foundPost = postsRepository.getPostById(req.params.id);
    if (!foundPost) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }

    const updatedPostFromBody = req.body;
    const newPost = { ...foundPost, ...updatedPostFromBody  };

    postsRepository.updatePostById(newPost);

    return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
})

postsController.delete('/:id', async (req: RequestWparams<{ id: string }>, res: Response) => {
    const foundPost = postsRepository.getPostById(req.params.id);
    if (!foundPost) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }

    postsRepository.deletePostById(foundPost.id);

    return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
})
