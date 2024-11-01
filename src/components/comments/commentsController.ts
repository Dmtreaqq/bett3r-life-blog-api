import {Router, Response, NextFunction} from "express";
import {HTTP_STATUSES, RequestWparams, RequestWparamsAndBody} from "../../common/utils/types";
import {CommentApiRequestModel, CommentApiResponseModel} from "./models/CommentApiModel";
import {commentsQueryRepository} from "./repositories/commentsQueryRepository";
import {commentsService} from "./services/commentsService";
import {jwtAuthMiddleware} from "../../common/middlewares/jwtAuthMiddleware";
import createEditCommentValidation from "./middlewares/createEditCommentValidation";
import commentUrlParamValidation from "./middlewares/commentUrlParamValidation";

export const commentsRouter = Router()

const commentsController = {
    async getCommentById(req: RequestWparams<{ id: string }>, res: Response<CommentApiResponseModel>, next: NextFunction) {
        try {
            const comment = await commentsQueryRepository.getCommentById(req.params.id)

            if (!comment) {
                return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            }

            return res.json(comment)
        } catch (err) {
            return next(err)
        }
    },
    async deleteCommentById(req: RequestWparams<{ id: string }>, res: Response, next: NextFunction) {
        try {
            const result = await commentsService.deleteCommentById(req.params.id, req.user.id)

            if (!result) {
                return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            }

            return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } catch (err) {
            return next(err)
        }
    },

    async updateCommentById(req: RequestWparamsAndBody<{ id: string }, CommentApiRequestModel>, res: Response, next: NextFunction) {
        try {
            const result = await commentsService.updateCommentById(req.params.id, req.body.content, req.user.id)

            if (!result) {
                return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            }

            return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } catch (err) {
            return next(err)
        }
    },
}

commentsRouter.get('/:id', ...commentUrlParamValidation, commentsController.getCommentById)
commentsRouter.delete('/:id', jwtAuthMiddleware, ...commentUrlParamValidation, commentsController.deleteCommentById)
commentsRouter.put('/:id', jwtAuthMiddleware, ...commentUrlParamValidation, ...createEditCommentValidation, commentsController.updateCommentById)
