import {commentsRepository} from "./repositories/commentsRepository";
import {ApiError} from "../../utils/ApiError";
import {HTTP_STATUSES} from "../../utils/types";
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
