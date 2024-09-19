import { Router, Request, Response } from 'express';
import { HTTP_STATUSES, RequestWbody, RequestWparams, RequestWparamsAndBody } from "../utils/types";
import { BlogInputModel, BlogViewModel } from "../models/BlogModel";
import { blogsRepository } from "../repositories/blogsRepository";
import createEditBlogValidationChains from '../middlewares/validation/createEditBlogValidationChains';

export const blogsController = Router();

blogsController.get('/', async (req: Request, res: Response<BlogViewModel[]>) => {
    const blogs = blogsRepository.getBlogs()
    return res.json(blogs);
})

blogsController.get('/:id', async (req: RequestWparams<{ id: string }>, res: Response<BlogViewModel>) => {
    const { id } = req.params;
    const foundPost = blogsRepository.getBlogById(id);

    if (!foundPost) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }

    return res.json(foundPost);
})

blogsController.post('/', ...createEditBlogValidationChains, async (req: RequestWbody<BlogInputModel>, res: Response<BlogViewModel>) => {
    const body = req.body;
    const post = blogsRepository.createBlog(body);

    return res.status(201).json(post);
})

blogsController.put('/:id', ...createEditBlogValidationChains, async (req: RequestWparamsAndBody<{ id: string }, BlogInputModel>, res: Response) => {
    const foundPost = blogsRepository.getBlogById(req.params.id);
    if (!foundPost) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }

    const updatedPostFromBody = req.body;
    const newPost = { ...foundPost, ...updatedPostFromBody  };

    blogsRepository.updateBlogById(newPost);

    return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
})

blogsController.delete('/:id', async (req: RequestWparams<{ id: string }>, res: Response) => {
    const foundPost = blogsRepository.getBlogById(req.params.id);
    if (!foundPost) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }

    blogsRepository.deleteBlogById(foundPost.id);

    return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
})
