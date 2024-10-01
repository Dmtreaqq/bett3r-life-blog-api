import { Router, Request, Response } from 'express';
import { HTTP_STATUSES, RequestWbody, RequestWparams, RequestWparamsAndBody } from "../../utils/types";
import { BlogApiRequestModel, BlogApiResponseModel } from "./models/BlogApiModel";
import { blogsRepository } from "./blogsRepository";
import createEditBlogValidationChains from './middlewares/createEditBlogValidationChains';
import { authMiddleware } from "../../middlewares/authMiddleware";
import { BlogDbModel } from "./models/BlogDbModel";
import blogUrlParamValidation from "./middlewares/blogUrlParamValidation";

export const blogsRouter = Router();

const blogsController = {
    async getBlogs(req: Request, res: Response<BlogApiResponseModel[]>){
        const blogs = await blogsRepository.getBlogs()

        const apiModelBlogs = blogs.map(blogsRepository.fromDbModelToResponseModel)

        return res.json(apiModelBlogs);
    },
    async getBlogById(req: RequestWparams<{ id: string }>, res: Response<BlogApiResponseModel>){
        const { id } = req.params;
        const foundPost = await blogsRepository.getBlogById(id);

        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        const apiModel = blogsRepository.fromDbModelToResponseModel(foundPost);

        return res.json(apiModel);
    },
    async createBlog(req: RequestWbody<BlogApiRequestModel>, res: Response<BlogApiResponseModel>){
        const body = req.body;
        const blog = await blogsRepository.createBlog(body);

        const apiModel = blogsRepository.fromDbModelToResponseModel(blog);

        return res.status(201).json(apiModel);
    },
    async editBlog(req: RequestWparamsAndBody<{ id: string }, BlogApiRequestModel>, res: Response){
        const foundPost = await blogsRepository.getBlogById(req.params.id);
        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        const updatedPostFromBody = req.body;
        const newPost: BlogDbModel = { ...foundPost, ...updatedPostFromBody  };

        await blogsRepository.updateBlogById(newPost);

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    },
    async deleteBlogById(req: RequestWparams<{ id: string }>, res: Response){
        const foundPost = await blogsRepository.getBlogById(req.params.id);
        if (!foundPost) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        await blogsRepository.deleteBlogById(foundPost._id.toString());

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }
}

blogsRouter.get('/', blogsController.getBlogs)
blogsRouter.get('/:id', ...blogUrlParamValidation, blogsController.getBlogById)
blogsRouter.post('/', authMiddleware, ...createEditBlogValidationChains, blogsController.createBlog)
blogsRouter.put('/:id', authMiddleware, ...blogUrlParamValidation, ...createEditBlogValidationChains, blogsController.editBlog)
blogsRouter.delete('/:id', authMiddleware, ...blogUrlParamValidation, blogsController.deleteBlogById)
