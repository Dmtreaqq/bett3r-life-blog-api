import { Router, Response, NextFunction } from "express";
import {
  HTTP_STATUSES,
  RequestWbody,
  RequestWparams,
  RequestWparamsAndBody,
  RequestWparamsAndQuery,
  RequestWquery,
} from "../../common/utils/types";
import { BlogApiRequestModel } from "./models/BlogApiRequestModel";
import { BlogApiResponseModel } from "./models/BlogApiResponseModel";
import { BlogsPaginatorApiResponseModel } from "./models/BlogsPaginatorApiResponseModel";
import { BlogCreatePostApiRequestModel } from "./models/BlogCreatePostApiRequestModel";
import { BlogsService } from "./blogsService";
import createEditBlogValidationChains from "./middlewares/createEditBlogValidationChains";
import { authMiddleware } from "../../common/middlewares/basicAuthMiddleware";
import blogUrlParamValidation from "./middlewares/blogUrlParamValidation";
import { BlogQueryGetModel } from "./models/BlogQueryGetModel";
import blogQueryValidation from "./middlewares/blogQueryValidation";
import createPostForBlogValidationChains from "./middlewares/createPostForBlogValidationChains";
import { PostQueryGetModel } from "../posts/models/PostQueryGetModel";
import postQueryValidation from "../posts/middlewares/postQueryValidation";
import { BlogsQueryRepository } from "./repositories/blogsQueryRepository";
import { PostsQueryRepository } from "../posts/repositories/postsQueryRepository";
import { PostApiResponseModel } from "../posts/models/PostApiResponseModel";
import { PostsPaginatorApiResponseModel } from "../posts/models/PostsPaginatorApiResponseModel";

export const blogsRouter = Router();

class BlogsController {
  private blogsService: BlogsService;
  private blogsQueryRepository: BlogsQueryRepository;
  private postsQueryRepository: PostsQueryRepository;
  constructor() {
    this.blogsService = new BlogsService();
    this.blogsQueryRepository = new BlogsQueryRepository();
    this.postsQueryRepository = new PostsQueryRepository();
  }

  async getBlogs(
    req: RequestWquery<BlogQueryGetModel>,
    res: Response<BlogsPaginatorApiResponseModel>,
    next: NextFunction,
  ) {
    try {
      const { searchNameTerm, pageSize, pageNumber, sortBy, sortDirection } = req.query;

      const response = await this.blogsQueryRepository.getBlogs(
        searchNameTerm,
        Number(pageSize) || 10,
        Number(pageNumber) || 1,
        sortBy,
        sortDirection,
      );

      return res.json(response);
    } catch (err) {
      return next(err);
    }
  }

  async getBlogById(
    req: RequestWparams<{ id: string }>,
    res: Response<BlogApiResponseModel>,
    next: NextFunction,
  ) {
    try {
      const foundBlog = await this.blogsQueryRepository.getBlogById(req.params.id);

      if (!foundBlog) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      }

      return res.json(foundBlog);
    } catch (err) {
      return next(err);
    }
  }

  async createBlog(
    req: RequestWbody<BlogApiRequestModel>,
    res: Response<BlogApiResponseModel>,
    next: NextFunction,
  ) {
    try {
      const blogId = await this.blogsService.createBlog(req.body);
      const blog = await this.blogsQueryRepository.getBlogById(blogId);

      if (!blog) {
        return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      }

      return res.status(HTTP_STATUSES.CREATED_201).json(blog);
    } catch (err) {
      return next(err);
    }
  }

  async editBlog(
    req: RequestWparamsAndBody<{ id: string }, BlogApiRequestModel>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id: blogId } = req.params;

      const result = await this.blogsService.updateBlogById(blogId, req.body);

      if (!result) {
        return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      }

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (error: unknown) {
      return next(error);
    }
  }

  async deleteBlogById(
    req: RequestWparams<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await this.blogsService.deleteBlogById(req.params.id);

      if (!result) {
        res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      }

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  }

  async createPostForBlog(
    req: RequestWparamsAndBody<{ id: string }, BlogCreatePostApiRequestModel>,
    res: Response<PostApiResponseModel>,
    next: NextFunction,
  ) {
    try {
      const { id: blogId } = req.params;

      const postId = await this.blogsService.createPostForBlog({
        ...req.body,
        blogId: blogId,
      });
      const post = await this.postsQueryRepository.getPostById(postId);

      if (!post) {
        return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      }

      return res.status(HTTP_STATUSES.CREATED_201).json(post);
    } catch (err: unknown) {
      return next(err);
    }
  }

  async getPostsForBlog(
    req: RequestWparamsAndQuery<{ id: string }, PostQueryGetModel>,
    res: Response<PostsPaginatorApiResponseModel>,
    next: NextFunction,
  ) {
    try {
      const { pageNumber, pageSize, sortDirection, sortBy } = req.query;

      const blog = await this.blogsQueryRepository.getBlogById(req.params.id);
      if (!blog) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      }

      const result = await this.postsQueryRepository.getPosts(
        blog.id,
        Number(pageNumber) || 1,
        Number(pageSize) || 10,
        sortBy,
        sortDirection,
      );

      return res.json(result);
    } catch (err) {
      return next(err);
    }
  }
}

const blogsController = new BlogsController();

blogsRouter.get("/", ...blogQueryValidation, blogsController.getBlogs.bind(blogsController));
blogsRouter.get(
  "/:id",
  ...blogUrlParamValidation,
  blogsController.getBlogById.bind(blogsController),
);
blogsRouter.get(
  "/:id/posts",
  ...blogUrlParamValidation,
  ...postQueryValidation,
  blogsController.getPostsForBlog.bind(blogsController),
);
blogsRouter.post(
  "/",
  authMiddleware,
  ...createEditBlogValidationChains,
  blogsController.createBlog.bind(blogsController),
);
blogsRouter.post(
  "/:id/posts",
  authMiddleware,
  ...blogUrlParamValidation,
  ...createPostForBlogValidationChains,
  blogsController.createPostForBlog.bind(blogsController),
);
blogsRouter.put(
  "/:id",
  authMiddleware,
  ...blogUrlParamValidation,
  ...createEditBlogValidationChains,
  blogsController.editBlog.bind(blogsController),
);
blogsRouter.delete(
  "/:id",
  authMiddleware,
  ...blogUrlParamValidation,
  blogsController.deleteBlogById.bind(blogsController),
);
