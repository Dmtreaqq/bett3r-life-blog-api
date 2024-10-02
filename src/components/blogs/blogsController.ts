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
import { blogsRepository } from "./blogsRepository";
import createEditBlogValidationChains from './middlewares/createEditBlogValidationChains';
import { authMiddleware } from "../../middlewares/authMiddleware";
import { BlogDbModel } from "./models/BlogDbModel";
import blogUrlParamValidation from "./middlewares/blogUrlParamValidation";
import { BlogQueryGetModel } from "./models/BlogQueryGetModel";
import blogQueryValidation from "./middlewares/blogQueryValidation";
import { PostApiRequestModel, PostApiResponseModel, PostsApiResponseModel } from "../posts/models/PostApiModel";
import { postsRepository } from "../posts/postsRepository";

import createPostForBlogValidationChains, { createBlogIdChain } from "./middlewares/createPostForBlogValidationChains";
import { PostQueryGetModel } from "../posts/models/PostQueryGetModel";
import postQueryValidation from "../posts/middlewares/postQueryValidation";

export const blogsRouter = Router();

const blogsController = {
    async getBlogs(req: RequestWquery<BlogQueryGetModel>, res: Response<BlogsApiResponseModel>){
        const { searchNameTerm, pageSize = 10, pageNumber = 1, sortBy, sortDirection } = req.query

        const blogs = await blogsRepository.getBlogs(
            searchNameTerm,
            Number(pageSize),
            Number(pageNumber),
            sortBy,
            sortDirection,
        )

        const blogsCount = await blogsRepository.getBlogsCount(searchNameTerm)

        const apiModelBlogs = blogs.map(blogsRepository.fromDbModelToResponseModel)

        const result: BlogsApiResponseModel = {
            items: apiModelBlogs,
            page: Number(pageNumber),
            pageSize: Number(pageSize),
            totalCount: blogsCount,
            pagesCount: Math.ceil(blogsCount / Number(pageSize)),
        }

        return res.json(result);
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
    },
    async createPostForBlog(req: RequestWparamsAndBody<{ id: string }, BlogCreatePostApiRequestModel>, res: Response<PostApiResponseModel>) {
        const post = await postsRepository.createPost({ ...req.body, blogId: req.params.id });

        return res.status(HTTP_STATUSES.CREATED_201).json(postsRepository.fromDbModelToResponseModel(post))
    },
    async getPostsForBlog(req: RequestWparamsAndQuery<{ id: string }, PostQueryGetModel>, res: Response<PostsApiResponseModel>) {
        const { pageNumber = 1, pageSize = 10, sortDirection, sortBy } = req.query

        const blog = await blogsRepository.getBlogById(req.params.id);
        if (!blog) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        const posts = await postsRepository.getPosts(blog._id.toString(), Number(pageNumber), Number(pageSize), sortBy, sortDirection)
        const postsCount = await postsRepository.getPostsCount(blog._id.toString());

        const apiModelPosts = posts.map(postsRepository.fromDbModelToResponseModel);

        const result: PostsApiResponseModel = {
            items: apiModelPosts,
            page: Number(pageNumber),
            pageSize: Number(pageSize),
            totalCount: postsCount,
            pagesCount: Math.ceil(postsCount / Number(pageSize)),
        }

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
