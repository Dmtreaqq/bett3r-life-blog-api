import {commentsRepository} from "../repositories/commentsRepository";
import {ApiError} from "../../../common/utils/ApiError";
import {HTTP_STATUSES} from "../../../common/utils/types";
import {CommentDbModel} from "../models/CommentDbModel";
import {postsRepository} from "../../posts/repositories/postsRepository";
import {CommentApiRequestModel} from "../models/CommentApiModel";
import {usersRepository} from "../../users/repositories/usersRepository";

export const commentsService = {
    async createComment(postId: string, comment: CommentApiRequestModel, userId: string): Promise<string> {
        const post = await postsRepository.getPostById(postId)

        if (!post) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        const user = await usersRepository.getUserById(userId)

        const commentDbModel: CommentDbModel = {
            content: comment.content,
            postId,
            commentatorInfo: {
                userId: userId,
                userLogin: user!.login
            },
            createdAt: new Date().toISOString()
        }

        return commentsRepository.createComment(commentDbModel)
    },
    // TODO: user: any описать
    async deleteCommentById(commentId: string, userId: string): Promise<boolean> {
        const comment = await commentsRepository.getCommentById(commentId)

        if (!comment) {
            // TODO - лучше возвращать что-то..
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        if (comment.commentatorInfo.userId !== userId) {
            throw new ApiError(HTTP_STATUSES.FORBIDDEN_403)
        }

        return commentsRepository.deleteCommentById(commentId)
    },

    async updateCommentById(commentId: string, content: string, userId: string): Promise<boolean> {
        const comment = await commentsRepository.getCommentById(commentId)

        if (!comment) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        if (comment.commentatorInfo.userId !== userId) {
            throw new ApiError(HTTP_STATUSES.FORBIDDEN_403)
        }

        return commentsRepository.updateCommentById(commentId, content)
    }
}
