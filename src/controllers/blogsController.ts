import { Router, Request, Response } from 'express';
import { HTTP_STATUSES, RequestWbody, RequestWparams, RequestWparamsAndBody } from "../utils/types";
import { BlogInputModel, BlogViewModel } from "../models/BlogModel";
import { blogsRepository } from "../repositories/blogsRepository";
import createEditBlogValidationChains from '../middlewares/validation/createEditBlogValidationChains';
import { authMiddleware } from "../middlewares/authMiddleware";

export const blogsRouter = Router();

const blogsController = {
    async getBlogs(req: Request, res: Response<BlogViewModel[]>){
        const blogs = await blogsRepository.getBlogs()
        return res.json(blogs);
    },
    async getBlogById(req: RequestWparams<{ id: string }>, res: Response<BlogViewModel>){
        const { id } = req.params;
        const foundPost = await blogsRepository.getBlogById(id);

        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        return res.json(foundPost);
    },
    async createBlog(req: RequestWbody<BlogInputModel>, res: Response<BlogViewModel>){
        const body = req.body;
        const post = await blogsRepository.createBlog(body);

        return res.status(201).json(post);
    },
    async editBlog(req: RequestWparamsAndBody<{ id: string }, BlogInputModel>, res: Response){
        const foundPost = await blogsRepository.getBlogById(req.params.id);
        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        const updatedPostFromBody = req.body;
        const newPost = { ...foundPost, ...updatedPostFromBody  };

        await blogsRepository.updateBlogById(newPost);

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    },
    async deleteBlogById(req: RequestWparams<{ id: string }>, res: Response){
        const foundPost = await blogsRepository.getBlogById(req.params.id);
        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        await blogsRepository.deleteBlogById(foundPost.id);

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }
}

blogsRouter.get('/', blogsController.getBlogs)
blogsRouter.get('/:id', blogsController.getBlogById)
blogsRouter.post('/', authMiddleware, ...createEditBlogValidationChains, blogsController.createBlog)
blogsRouter.put('/:id', authMiddleware, ...createEditBlogValidationChains, blogsController.editBlog)
blogsRouter.delete('/:id', authMiddleware, blogsController.deleteBlogById)
