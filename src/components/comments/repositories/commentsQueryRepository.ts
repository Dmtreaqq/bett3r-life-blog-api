import {CommentApiResponseModel} from "../models/CommentApiModel";
import {commentsCollection} from "../../../db/db";
import {ObjectId} from "mongodb";

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
    }
}
