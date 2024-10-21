import {Router, Response, NextFunction} from 'express';
import {
    HTTP_STATUSES,
    RequestWbody,
    RequestWparams,
    RequestWparamsAndBody,
    RequestWparamsAndQuery,
    RequestWquery
} from "../../common/utils/types";
import {
    BlogApiRequestModel,
    BlogApiResponseModel,
    BlogCreatePostApiRequestModel,
    BlogsApiResponseModel
} from "./models/BlogApiModel";
import { blogsService } from "./blogsService";
import createEditBlogValidationChains from './middlewares/createEditBlogValidationChains';
import { authMiddleware } from "../../common/middlewares/basicAuthMiddleware";
import blogUrlParamValidation from "./middlewares/blogUrlParamValidation";
import { BlogQueryGetModel } from "./models/BlogQueryGetModel";
import blogQueryValidation from "./middlewares/blogQueryValidation";
import { PostApiResponseModel, PostsApiResponseModel } from "../posts/models/PostApiModel";

import createPostForBlogValidationChains from "./middlewares/createPostForBlogValidationChains";
import { PostQueryGetModel } from "../posts/models/PostQueryGetModel";
import postQueryValidation from "../posts/middlewares/postQueryValidation";
import {blogsQueryRepository} from "./repositories/blogsQueryRepository";
import {postsQueryRepository} from "../posts/repositories/postsQueryRepository";
import {blogsRepository} from "./repositories/blogsRepository";

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
        // TODO where to throw error ???
        const foundBlog = await blogsQueryRepository.getBlogById(req.params.id);

        if (!foundBlog) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        return res.json(foundBlog);
    },
    async createBlog(req: RequestWbody<BlogApiRequestModel>, res: Response<BlogApiResponseModel>, next: NextFunction){
        try {
            const blogId = await blogsService.createBlog(req.body);
            const blog = await blogsQueryRepository.getBlogById(blogId)

            if (!blog) {
                return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            }

            return res.status(HTTP_STATUSES.CREATED_201).json(blog);
        } catch (err) {
            return next(err);
        }
    },
    async editBlog(req: RequestWparamsAndBody<{ id: string }, BlogApiRequestModel>, res: Response, next: NextFunction){
        try {
            const { id: blogId } = req.params;

            const result = await blogsService.updateBlogById(blogId, req.body)

            if (!result) {
                return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            }

            return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } catch (error: any) {
            // TODO: How to do without return? Typescript argues
            // TODO: We also dont see which status code was sent
            return next(error)
        }
    },
    async deleteBlogById(req: RequestWparams<{ id: string }>, res: Response, next: NextFunction){
        try {
            const result = await blogsService.deleteBlogById(req.params.id);

            if(!result) {
                res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            }

            return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
        } catch (err) {
            return next(err)
        }
    },
    async createPostForBlog(req: RequestWparamsAndBody<{ id: string }, BlogCreatePostApiRequestModel>, res: Response<PostApiResponseModel>, next: NextFunction) {
        try {
            const { id: blogId } = req.params;

            const postId = await blogsService.createPostForBlog({ ...req.body, blogId: blogId })
            const post = await postsQueryRepository.getPostById(postId);

            if (!post) {
                return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
            }

            return res.status(HTTP_STATUSES.CREATED_201).json(post)
        } catch (err: any) {
            return next(err)
        }
    },
    async getPostsForBlog(req: RequestWparamsAndQuery<{ id: string }, PostQueryGetModel>, res: Response<PostsApiResponseModel>) {
        const { pageNumber, pageSize, sortDirection, sortBy } = req.query

        const blog = await blogsQueryRepository.getBlogById(req.params.id);
        if (!blog) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        const result = await postsQueryRepository.getPosts(
            blog.id,
            Number(pageNumber) || 1,
            Number(pageSize) || 10,
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
