import { Router, Response } from 'express';
import {
    HTTP_STATUSES,
    RequestWbody,
    RequestWparams,
    RequestWparamsAndBody,
    RequestWparamsAndQuery,
    RequestWquery
} from "../../utils/types";
import {
    BlogApiRequestModel,
    BlogApiResponseModel,
    BlogCreatePostApiRequestModel,
    BlogsApiResponseModel
} from "./models/BlogApiModel";
import { blogsService } from "./blogsService";
import createEditBlogValidationChains from './middlewares/createEditBlogValidationChains';
import { authMiddleware } from "../../middlewares/authMiddleware";
import blogUrlParamValidation from "./middlewares/blogUrlParamValidation";
import { BlogQueryGetModel } from "./models/BlogQueryGetModel";
import blogQueryValidation from "./middlewares/blogQueryValidation";
import { PostApiResponseModel, PostsApiResponseModel } from "../posts/models/PostApiModel";

import createPostForBlogValidationChains from "./middlewares/createPostForBlogValidationChains";
import { PostQueryGetModel } from "../posts/models/PostQueryGetModel";
import postQueryValidation from "../posts/middlewares/postQueryValidation";
import {blogsQueryRepository} from "./repositories/blogsQueryRepository";

export const blogsRouter = Router();

const blogsController = {
    async getBlogs(req: RequestWquery<BlogQueryGetModel>, res: Response<BlogsApiResponseModel>){
        const { searchNameTerm, pageSize, pageNumber, sortBy, sortDirection } = req.query

        const response = await blogsQueryRepository.getBlogs(
            searchNameTerm,
            Number(pageSize) || 10,
            Number(pageNumber) || 1,
            sortBy,
            sortDirection
        )

        return res.json(response);
    },
    async getBlogById(req: RequestWparams<{ id: string }>, res: Response<BlogApiResponseModel>){
        const foundBlog = await blogsQueryRepository.getBlogById(req.params.id);

        if (!foundBlog) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        return res.json(foundBlog);
    },
    async createBlog(req: RequestWbody<BlogApiRequestModel>, res: Response<BlogApiResponseModel>){
        const blog = await blogsService.createBlog(req.body);

        return res.status(201).json(blog);
    },
    async editBlog(req: RequestWparamsAndBody<{ id: string }, BlogApiRequestModel>, res: Response){
        const foundBlog = await blogsQueryRepository.getBlogById(req.params.id);
        if (!foundBlog) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        const newBlog = { ...foundBlog, ...req.body };
        await blogsService.updateBlog(newBlog)

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    },
    async deleteBlogById(req: RequestWparams<{ id: string }>, res: Response){
        const foundBlog = await blogsQueryRepository.getBlogById(req.params.id);
        if (!foundBlog) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        await blogsService.deleteBlogById(foundBlog.id);

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    },
    async createPostForBlog(req: RequestWparamsAndBody<{ id: string }, BlogCreatePostApiRequestModel>, res: Response<PostApiResponseModel>) {
        const blog = await blogsQueryRepository.getBlogById(req.params.id);
        if (!blog) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        const post = await blogsService.createPostForBlog({ ...req.body, blogId: req.params.id })

        if (!post) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        return res.status(HTTP_STATUSES.CREATED_201).json(post)
    },
    async getPostsForBlog(req: RequestWparamsAndQuery<{ id: string }, PostQueryGetModel>, res: Response<PostsApiResponseModel>) {
        const { pageNumber, pageSize, sortDirection, sortBy } = req.query

        const blog = await blogsQueryRepository.getBlogById(req.params.id);
        if (!blog) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        const result = await blogsService.getPostsByBlogId(
            blog.id,
            Number(pageNumber),
            Number(pageSize),
            sortBy,
            sortDirection
        )

        return res.json(result);
    }
}

blogsRouter.get('/', ...blogQueryValidation, blogsController.getBlogs)
blogsRouter.get('/:id', ...blogUrlParamValidation, blogsController.getBlogById)
blogsRouter.get('/:id/posts', ...blogUrlParamValidation, ...postQueryValidation, blogsController.getPostsForBlog)
blogsRouter.post('/', authMiddleware, ...createEditBlogValidationChains, blogsController.createBlog)
blogsRouter.post('/:id/posts', authMiddleware, ...blogUrlParamValidation, ...createPostForBlogValidationChains, blogsController.createPostForBlog)
blogsRouter.put('/:id', authMiddleware, ...blogUrlParamValidation, ...createEditBlogValidationChains, blogsController.editBlog)
blogsRouter.delete('/:id', authMiddleware, ...blogUrlParamValidation, blogsController.deleteBlogById)
