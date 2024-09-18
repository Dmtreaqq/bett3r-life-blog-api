import { Router, Request, Response } from 'express';
import { postsDB } from "../db";
import { RequestWbody, RequestWparams, RequestWparamsAndBody } from "../config/types";
import { PostInputModel, PostViewModel } from "../models/PostModel";
import { postsRepository } from "../repositories/postsRepository";




export const postsController = Router();

postsController.get('/', async (req: Request, res: Response) => {
    return res.json(postsDB);
})

postsController.get('/:id', async (req: RequestWparams<{ id: string }>, res: Response<PostViewModel>) => {
    const { id } = req.params;
    const foundPost = postsRepository.getPostById(id);

    if (!foundPost) {
        return res.sendStatus(404);
    }

    return res.json(foundPost);
})

postsController.post('/', async (req: RequestWbody<PostInputModel>, res: Response<PostViewModel>) => {
    const body = req.body;
    const post = postsRepository.createPost(body);

    return res.status(201).json(post);
})

postsController.put('/:id', async (req: RequestWparamsAndBody<{ id: string }, PostInputModel>, res: Response) => {
    const foundPost = postsRepository.getPostById(req.params.id);
    if (!foundPost) {
        return res.sendStatus(404);
    }

    const updatedPostFromBody = req.body;
    const newPost = { ...foundPost, ...updatedPostFromBody  };

    postsRepository.updatePostById(newPost);

    return res.sendStatus(204);
})

postsController.delete('/:id', async (req: RequestWparams<{ id: string }>, res: Response) => {
    const foundPost = postsRepository.getPostById(req.params.id);
    if (!foundPost) {
        return res.sendStatus(404);
    }

    postsRepository.deletePostById(foundPost.id);

    return res.sendStatus(204);
})
