import {commentsRepository} from "./repositories/commentsRepository";
import {ApiError} from "../../common/utils/ApiError";
import {HTTP_STATUSES} from "../../common/utils/types";
import {CommentDbModel} from "./models/CommentDbModel";
import {postsRepository} from "../posts/repositories/postsRepository";
import {CommentApiRequestModel} from "./models/CommentApiModel";

export const commentsService = {
    async createComment(postId: string, comment: CommentApiRequestModel, user: any): Promise<string> {
        const post = await postsRepository.getPostById(postId)

        if (!post) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        const commentDbModel: CommentDbModel = {
            content: comment.content,
            postId,
            commentatorInfo: {
                userId: user.id,
                userLogin: user.login
            },
            createdAt: new Date().toISOString()
        }

        return commentsRepository.createComment(commentDbModel)
    },
    // TODO: user: any описать
    async deleteCommentById(commentId: string, user: any): Promise<boolean> {
        const comment = await commentsRepository.getCommentById(commentId)

        if (!comment) {
            // TODO - лучше возвращать что-то..
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        if (comment.commentatorInfo.userId !== user.id) {
            throw new ApiError(HTTP_STATUSES.FORBIDDEN_403)
        }

        return commentsRepository.deleteCommentById(commentId)
    },

    async updateCommentById(commentId: string, content: string, user: any): Promise<boolean> {
        const comment = await commentsRepository.getCommentById(commentId)

        if (!comment) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        if (comment.commentatorInfo.userId !== user.id) {
            throw new ApiError(HTTP_STATUSES.FORBIDDEN_403)
        }

        return commentsRepository.updateCommentById(commentId, content)
    }
}
