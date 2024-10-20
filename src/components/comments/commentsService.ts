import {commentsRepository} from "./repositories/commentsRepository";
import {ApiError} from "../../utils/ApiError";
import {HTTP_STATUSES} from "../../utils/types";

export const commentsService = {
    // async createComment(comment: CommentApiRequestModel): Promise<string> {
    //
    // }
    async deleteCommentById(commentId: string): Promise<boolean> {
        const comment = await commentsRepository.getCommentById(commentId)

        // TODO сделать проверку что етот комент принадлежит юзеру

        if (!comment) {
            // TODO -лучше возвращать что-то
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        return commentsRepository.deleteCommentById(commentId)
    }
}
