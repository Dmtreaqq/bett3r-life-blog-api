import {CommentDbModel} from "../models/CommentDbModel";
import {commentsCollection} from "../../../db/db";
import {ObjectId} from "mongodb";

export const commentsRepository = {
    async getCommentById(commentId: string): Promise<CommentDbModel | null> {
        return commentsCollection.findOne({ _id: new ObjectId(commentId) })
    },

    async createComment(comment: CommentDbModel): Promise<string> {
        const result = await commentsCollection.insertOne(comment)

        return result.insertedId.toString()
    },

    async deleteCommentById(commentId: string): Promise<boolean> {
        const result = await commentsCollection.deleteOne({ _id: new ObjectId(commentId) })

        return result.deletedCount === 1
    }
}
