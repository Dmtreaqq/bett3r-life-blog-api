import { Router, Response, NextFunction } from "express";
import {
  HTTP_STATUSES,
  RequestWparams,
  RequestWparamsAndBody,
} from "../../common/utils/types";
import { CommentsQueryRepository } from "./repositories/commentsQueryRepository";
import { CommentsService } from "./services/commentsService";
import { jwtAuthMiddleware } from "../../common/middlewares/jwtAuthMiddleware";
import createEditCommentValidation from "./middlewares/createEditCommentValidation";
import commentUrlParamValidation from "./middlewares/commentUrlParamValidation";
import { CommentApiRequestModel } from "./models/CommentApiRequestModel";
import { CommentApiResponseModel } from "./models/CommentApiResponseModel";
import likeCommentValidation from "./middlewares/likeCommentValidation";
import { CommentLikeApiRequestModel } from "./models/CommentLikeApiRequestModel";

export const commentsRouter = Router();

class CommentsController {
  private commentsService: CommentsService;
  private commentsQueryRepository: CommentsQueryRepository;
  constructor() {
    this.commentsService = new CommentsService();
    this.commentsQueryRepository = new CommentsQueryRepository();
  }

  async getCommentById(
    req: RequestWparams<{ id: string }>,
    res: Response<CommentApiResponseModel>,
    next: NextFunction,
  ) {
    try {
      const authHeader = req.headers.authorization;

      const token = authHeader?.split(" ")[1];

      const comment = await this.commentsQueryRepository.getCommentById(req.params.id, token);

      if (!comment) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      }

      return res.json(comment);
    } catch (err) {
      return next(err);
    }
  }

  async deleteCommentById(
    req: RequestWparams<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await this.commentsService.deleteCommentById(req.params.id, req.user.id);

      if (!result) {
        return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      }

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  }

  async updateCommentById(
    req: RequestWparamsAndBody<{ id: string }, CommentApiRequestModel>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await this.commentsService.updateCommentById(
        req.params.id,
        req.body.content,
        req.user.id,
      );

      if (!result) {
        return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
      }

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  }

  async updateLikeStatus(
    req: RequestWparamsAndBody<{ id: string }, CommentLikeApiRequestModel>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await this.commentsService.updateLikesOnCommentById(
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

const commentsController = new CommentsController();

commentsRouter.get(
  "/:id",
  ...commentUrlParamValidation,
  commentsController.getCommentById.bind(commentsController),
);
commentsRouter.delete(
  "/:id",
  jwtAuthMiddleware,
  ...commentUrlParamValidation,
  commentsController.deleteCommentById.bind(commentsController),
);
commentsRouter.put(
  "/:id",
  jwtAuthMiddleware,
  ...commentUrlParamValidation,
  ...createEditCommentValidation,
  commentsController.updateCommentById.bind(commentsController),
);
commentsRouter.put(
  "/:id/like-status",
  jwtAuthMiddleware,
  ...commentUrlParamValidation,
  ...likeCommentValidation,
  commentsController.updateLikeStatus.bind(commentsController),
);
