import { Router, Response, NextFunction } from "express";
import {
  HTTP_STATUSES,
  RequestWbody,
  RequestWparams,
  RequestWparamsAndBody,
  RequestWparamsAndQuery,
  RequestWquery,
} from "../../common/utils/types";
import createEditPostValidationChains from "./middlewares/createEditPostValidationChains";
import { authMiddleware } from "../../common/middlewares/basicAuthMiddleware";
import postUrlParamValidation from "./middlewares/postUrlParamValidation";
import postQueryValidation from "./middlewares/postQueryValidation";
import { PostQueryGetModel } from "./models/PostQueryGetModel";
import { PostsService } from "./postsService";
import { PostsQueryRepository } from "./repositories/postsQueryRepository";
import { CommentsPaginatorApiResponseModel } from "../comments/models/CommentsPaginatorApiResponseModel";
import { jwtAuthMiddleware } from "../../common/middlewares/jwtAuthMiddleware";
import { CommentsService } from "../comments/services/commentsService";
import { CommentsQueryRepository } from "../comments/repositories/commentsQueryRepository";
import { CommentQueryGetModel } from "../comments/models/CommentQueryGetModel";
import createEditCommentValidation from "../comments/middlewares/createEditCommentValidation";
import { CommentsQueryService } from "../comments/services/commentsQueryService";
import { PostApiResponseModel } from "./models/PostApiResponseModel";
import { PostsPaginatorApiResponseModel } from "./models/PostsPaginatorApiResponseModel";
import { PostApiRequestModel } from "./models/PostApiRequestModel";
import { CommentApiRequestModel } from "../comments/models/CommentApiRequestModel";
import { CommentApiResponseModel } from "../comments/models/CommentApiResponseModel";
import { PostLikeApiRequestModel } from "./models/PostLikeApiRequestModel";
import likeCommentValidation from "../comments/middlewares/likeCommentValidation";

export const postsRouter = Router();

class PostsController {
  private postsService: PostsService;
  private postsQueryRepository: PostsQueryRepository;
  private commentsService: CommentsService;
  private commentsQueryService: CommentsQueryService;
  private commentsQueryRepository: CommentsQueryRepository;

  constructor() {
    this.postsService = new PostsService();
    this.postsQueryRepository = new PostsQueryRepository();
    this.commentsService = new CommentsService();
    this.commentsQueryService = new CommentsQueryService();
    this.commentsQueryRepository = new CommentsQueryRepository();
  }

  async getPosts(
    req: RequestWquery<PostQueryGetModel>,
    res: Response<PostsPaginatorApiResponseModel>,
    next: NextFunction,
  ) {
    try {
      const { pageNumber, pageSize, sortBy, sortDirection } = req.query;
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      const result = await this.postsQueryRepository.getPosts(
        "",
        Number(pageNumber) || 1,
        Number(pageSize) || 10,
        sortBy,
        sortDirection,
        token,
      );

      return res.json(result);
    } catch (err) {
      return next(err);
    }
  }

  async getPostById(
    req: RequestWparams<{ id: string }>,
    res: Response<PostApiResponseModel>,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const authHeader = req.headers.authorization;

      const token = authHeader?.split(" ")[1];
      const foundPost = await this.postsQueryRepository.getPostById(id, token);

      if (!foundPost) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      }

      return res.json(foundPost);
    } catch (err) {
      return next(err);
    }
  }

  async createPost(
    req: RequestWbody<PostApiRequestModel>,
    res: Response<PostApiResponseModel>,
    next: NextFunction,
  ) {
    try {
      const postId = await this.postsService.createPost(req.body);
      const post = await this.postsQueryRepository.getPostById(postId);

      if (!post) {
        return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      }

      return res.status(HTTP_STATUSES.CREATED_201).json(post);
    } catch (err: unknown) {
      return next(err);
    }
  }

  async editPost(
    req: RequestWparamsAndBody<{ id: string }, PostApiRequestModel>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await this.postsService.updatePost(req.params.id, req.body);

      if (!result) {
        return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      }

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err: unknown) {
      return next(err);
    }
  }

  async deletePostById(
    req: RequestWparams<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await this.postsService.deletePostById(req.params.id);

      if (!result) {
        return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      }

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  }

  async createCommentForPost(
    req: RequestWparamsAndBody<{ id: string }, CommentApiRequestModel>,
    res: Response<CommentApiResponseModel>,
    next: NextFunction,
  ) {
    const { id: postId } = req.params;
    try {
      const commentId = await this.commentsService.createComment(
        postId,
        req.body,
        req.user.id,
      );

      const authHeader = req.headers.authorization;
      if (!authHeader) return res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401);
      const token = authHeader.split(" ")[1];
      const comment = await this.commentsQueryRepository.getCommentById(commentId, token);

      if (!comment) {
        return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      }

      return res.status(HTTP_STATUSES.CREATED_201).json(comment);
    } catch (err) {
      return next(err);
    }
  }

  async getCommentsForPost(
    req: RequestWparamsAndQuery<{ id: string }, CommentQueryGetModel>,
    res: Response<CommentsPaginatorApiResponseModel>,
    next: NextFunction,
  ) {
    try {
      const { pageNumber, pageSize, sortBy, sortDirection } = req.query;
      const { id: postId } = req.params;

      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      const comments = await this.commentsQueryService.getCommentsForPost(
        postId,
        Number(pageNumber) || 1,
        Number(pageSize) || 10,
        sortBy,
        sortDirection,
        token,
      );

      return res.json(comments);
    } catch (err) {
      return next(err);
    }
  }

  async updateLikeStatus(
    req: RequestWparamsAndBody<{ id: string }, PostLikeApiRequestModel>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await this.postsService.updateLikesOnPostById(
        req.params.id,
        req.body.likeStatus,
        req.user.id,
      );

      // if (!result) {
      //   return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      // }

      // TODO: update user stats

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  }
}

const postsController = new PostsController();

postsRouter.post(
  "/:id/comments",
  jwtAuthMiddleware,
  ...postUrlParamValidation,
  ...createEditCommentValidation,
  postsController.createCommentForPost.bind(postsController),
);
postsRouter.get(
  "/:id/comments",
  ...postUrlParamValidation,
  postsController.getCommentsForPost.bind(postsController),
);

postsRouter.get("/", ...postQueryValidation, postsController.getPosts.bind(postsController));
postsRouter.get(
  "/:id",
  ...postUrlParamValidation,
  postsController.getPostById.bind(postsController),
);
postsRouter.post(
  "/",
  authMiddleware,
  ...createEditPostValidationChains,
  postsController.createPost.bind(postsController),
);
postsRouter.put(
  "/:id",
  authMiddleware,
  ...postUrlParamValidation,
  ...createEditPostValidationChains,
  postsController.editPost.bind(postsController),
);
postsRouter.delete(
  "/:id",
  authMiddleware,
  ...postUrlParamValidation,
  postsController.deletePostById.bind(postsController),
);
postsRouter.put(
  "/:id/like-status",
  jwtAuthMiddleware,
  ...likeCommentValidation,
  postsController.updateLikeStatus.bind(postsController),
);
