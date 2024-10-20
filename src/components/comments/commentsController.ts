import {Router, Response} from "express";
import {HTTP_STATUSES, RequestWparams, RequestWparamsAndBody} from "../../utils/types";
import {CommentApiRequestModel, CommentApiResponseModel} from "./models/CommentApiModel";
import {commentsQueryRepository} from "./repositories/commentsQueryRepository";
import {commentsService} from "./commentsService";
import {jwtAuthMiddleware} from "../../middlewares/jwtAuthMiddleware";
import createEditCommentValidation from "./middlewares/createEditCommentValidation";

export const commentsRouter = Router()

const commentsController = {
    async getCommentById(req: RequestWparams<{ id: string }>, res: Response<CommentApiResponseModel>) {
        const comment = await commentsQueryRepository.getCommentById(req.params.id)

        if (!comment) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }

        return res.json(comment)
    },
    async deleteCommentById(req: RequestWparams<{ id: string }>, res: Response) {
        const result = await commentsService.deleteCommentById(req.params.id, req.user)

        if (!result) {
            return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
        }

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    },

    async updateCommentById(req: RequestWparamsAndBody<{ id: string }, CommentApiRequestModel>, res: Response) {
        const result = await commentsService.updateCommentById(req.params.id, req.body.content, req.user)

        if (!result) {
            return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
        }

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    },
}

commentsRouter.get('/:id', jwtAuthMiddleware, commentsController.getCommentById)
commentsRouter.delete('/:id', jwtAuthMiddleware, commentsController.deleteCommentById)
commentsRouter.put('/:id', jwtAuthMiddleware, ...createEditCommentValidation, commentsController.updateCommentById)
