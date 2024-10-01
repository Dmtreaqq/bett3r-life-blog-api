import { Router, Response } from 'express';
import {
    HTTP_STATUSES,
    RequestWbody,
    RequestWparams,
    RequestWparamsAndBody,
    RequestWparamsAndQuery,
    RequestWquery
} from "../../utils/types";
import { BlogApiRequestModel, BlogApiResponseModel, BlogCreatePostApiRequestModel } from "./models/BlogApiModel";
import { blogsRepository } from "./blogsRepository";
import createEditBlogValidationChains from './middlewares/createEditBlogValidationChains';
import { authMiddleware } from "../../middlewares/authMiddleware";
import { BlogDbModel } from "./models/BlogDbModel";
import blogUrlParamValidation from "./middlewares/blogUrlParamValidation";
import { BlogQueryGetModel } from "./models/BlogQueryGetModel";
import blogQueryValidation from "./middlewares/blogQueryValidation";
import { PostApiRequestModel, PostApiResponseModel } from "../posts/models/PostApiModel";
import { postsRepository } from "../posts/postsRepository";

import createPostForBlogValidationChains, { createBlogIdChain } from "./middlewares/createPostForBlogValidationChains";
import { PostQueryGetModel } from "../posts/models/PostQueryGetModel";
import postQueryValidation from "../posts/middlewares/postQueryValidation";

export const blogsRouter = Router();

const blogsController = {
    async getBlogs(req: RequestWquery<BlogQueryGetModel>, res: Response<BlogApiResponseModel[]>){
        const { searchNameTerm, pageSize, pageNumber, sortBy, sortDirection } = req.query

        const blogs = await blogsRepository.getBlogs(
            searchNameTerm,
            Number(pageSize),
            Number(pageNumber),
            sortBy,
            sortDirection,
        )

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
    },
    async createPostForBlog(req: RequestWparamsAndBody<{ id: string }, BlogCreatePostApiRequestModel>, res: Response<PostApiResponseModel>) {
        const post = await postsRepository.createPost({ ...req.body, blogId: req.params.id });

        return res.status(HTTP_STATUSES.CREATED_201).json(postsRepository.fromDbModelToResponseModel(post))
    },
    async getPostsForBlog(req: RequestWparamsAndQuery<{ id: string }, PostQueryGetModel>, res: Response<PostApiResponseModel[]>) {
        const { pageNumber, pageSize, sortDirection, sortBy } = req.query

        const posts = await postsRepository.getPosts(Number(pageNumber), Number(pageSize), sortBy, sortDirection)

        return res.status(HTTP_STATUSES.OK_200).json(posts.map(postsRepository.fromDbModelToResponseModel))
    }
}

blogsRouter.get('/', ...blogQueryValidation, blogsController.getBlogs)
blogsRouter.get('/:id', ...blogUrlParamValidation, blogsController.getBlogById)
blogsRouter.get('/:id/posts', ...blogUrlParamValidation, createBlogIdChain(), ...postQueryValidation, blogsController.getPostsForBlog)

blogsRouter.post('/', authMiddleware, ...createEditBlogValidationChains, blogsController.createBlog)
blogsRouter.post('/:id/posts', authMiddleware, ...blogUrlParamValidation, ...createPostForBlogValidationChains, blogsController.createPostForBlog)

blogsRouter.put('/:id', authMiddleware, ...blogUrlParamValidation, ...createEditBlogValidationChains, blogsController.editBlog)

blogsRouter.delete('/:id', authMiddleware, ...blogUrlParamValidation, blogsController.deleteBlogById)
