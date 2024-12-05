import { CommentDbModel } from "../models/CommentDbModel";
import { ObjectId } from "mongodb";
import { CommentClassModel } from "../../../common/db/models/Comment";
import { ReactionEnum } from "../../users/models/UserDbModel";
import { injectable } from "inversify";

@injectable()
export class CommentsRepository {
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

  async updateLikesOnCommentById(commentId: string, likes: number, op: ReactionEnum) {
    const num = op === ReactionEnum.Like ? 1 : -1;

    const result = await CommentClassModel.updateOne(
      {
        _id: new ObjectId(commentId),
      },
      {
        "likesInfo.likesCount": likes + num,
      },
    );

    return result.modifiedCount === 1;
  }

  async updateDislikesOnCommentById(commentId: string, dislikes: number, op: ReactionEnum) {
    const num = op === ReactionEnum.Dislike ? 1 : -1;

    const result = await CommentClassModel.updateOne(
      {
        _id: new ObjectId(commentId),
      },
      {
        "likesInfo.dislikesCount": dislikes + num,
      },
    );

    return result.modifiedCount === 1;
  }
}
