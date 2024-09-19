import { Router, Request, Response } from 'express';
import { blogsDB } from "../db";
import { RequestWbody, RequestWparams, RequestWparamsAndBody } from "../config/types";
import { BlogInputModel, BlogViewModel } from "../models/BlogModel";
import { blogsRepository } from "../repositories/blogsRepository";

export const blogsController = Router();

blogsController.get('/', async (req: Request, res: Response<BlogViewModel[]>) => {
    return res.json(blogsDB);
})

blogsController.get('/:id', async (req: RequestWparams<{ id: string }>, res: Response<BlogViewModel>) => {
    const { id } = req.params;
    const foundPost = blogsRepository.getBlogById(id);

    if (!foundPost) {
        return res.sendStatus(404);
    }

    return res.json(foundPost);
})

blogsController.post('/', async (req: RequestWbody<BlogInputModel>, res: Response<BlogViewModel>) => {
    const body = req.body;
    const post = blogsRepository.createBlog(body);

    return res.status(201).json(post);
})

blogsController.put('/:id', async (req: RequestWparamsAndBody<{ id: string }, BlogInputModel>, res: Response) => {
    const foundPost = blogsRepository.getBlogById(req.params.id);
    if (!foundPost) {
        return res.sendStatus(404);
    }

    const updatedPostFromBody = req.body;
    const newPost = { ...foundPost, ...updatedPostFromBody  };

    blogsRepository.updateBlogById(newPost);

    return res.sendStatus(204);
})

blogsController.delete('/:id', async (req: RequestWparams<{ id: string }>, res: Response) => {
    const foundPost = blogsRepository.getBlogById(req.params.id);
    if (!foundPost) {
        return res.sendStatus(404);
    }

    blogsRepository.deleteBlogById(foundPost.id);

    return res.sendStatus(204);
})
