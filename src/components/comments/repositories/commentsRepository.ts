import { CommentDbModel } from "../models/CommentDbModel";
import { ObjectId } from "mongodb";
import { CommentClassModel } from "../../../common/db/models/Comment";

class CommentsRepository {
  async getCommentById(commentId: string): Promise<CommentDbModel | null> {
    return CommentClassModel.findOne({ _id: new ObjectId(commentId) });
  }

  async createComment(comment: CommentDbModel): Promise<string> {
    const result = await CommentClassModel.create(comment);

    return result._id.toString();
  }

  async deleteCommentById(commentId: string): Promise<boolean> {
    const result = await CommentClassModel.deleteOne({
      _id: new ObjectId(commentId),
    });

    return result.deletedCount === 1;
  }

  async updateCommentById(commentId: string, commentContent: string) {
    const result = await CommentClassModel.updateOne(
      {
        _id: new ObjectId(commentId),
      },
      {
        $set: {
          content: commentContent,
        },
      },
    );

    return result.modifiedCount === 1;
  }
}

export const commentsRepository = new CommentsRepository();
