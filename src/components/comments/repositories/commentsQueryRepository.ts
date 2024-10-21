import {CommentApiResponseModel, CommentsApiResponseModel} from "../models/CommentApiModel";
import {commentsCollection} from "../../../common/db/db";
import {Filter, ObjectId} from "mongodb";
import {CommentDbModel} from "../models/CommentDbModel";
import {postsQueryRepository} from "../../posts/repositories/postsQueryRepository";
import {ApiError} from "../../../common/utils/ApiError";
import {HTTP_STATUSES} from "../../../common/utils/types";

export const commentsQueryRepository = {
    async getCommentById(commentId: string): Promise<CommentApiResponseModel | null> {
        const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) })

        if (!comment) return null

        return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            createdAt: comment.createdAt
        }
    },

    async getComments(postId: string, pageNumber = 1, pageSize = 10, sortBy = 'createdAt', sortDirection: 'asc' | 'desc' = 'desc'): Promise<CommentsApiResponseModel> {
        const filter: Filter<CommentDbModel> = {}

        // TODO: нормально ли из одного квери репо ходить в другой только для проверки данньіх
        const post = await postsQueryRepository.getPostById(postId)
        if (!post) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        if (postId) {
            filter.postId = postId
        }

        const comments = await commentsCollection
            .find(filter)
            .sort(sortBy, sortDirection)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()

        const postsResponse = comments.map(comment => {
            return {
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin
                },
                createdAt: comment.createdAt
            }
        });
        const commentsCount = await this.getCommentsCount(postId);

        return {
            items: postsResponse,
            page: Number(pageNumber),
            pageSize: Number(pageSize),
            totalCount: commentsCount,
            pagesCount: commentsCount <= pageSize ? 1 : Math.ceil(commentsCount / Number(pageSize)),
        }
    },

    async getCommentsCount(postId: string) {
        const filter: Filter<CommentDbModel> = {}

        if (postId) {
            filter.postId = postId
        }

        return commentsCollection.countDocuments(filter)
    }
}
