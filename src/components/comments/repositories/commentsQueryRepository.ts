import { CommentsPaginatorApiResponseModel } from "../models/CommentsPaginatorApiResponseModel";
import { ObjectId } from "mongodb";
import { CommentDbModel } from "../models/CommentDbModel";
import { CommentClassModel } from "../../../common/db/models/Comment";
import { RootFilterQuery } from "mongoose";
import { CommentApiResponseModel } from "../models/CommentApiResponseModel";

export class CommentsQueryRepository {
  async getCommentById(commentId: string): Promise<CommentApiResponseModel | null> {
    const comment = await CommentClassModel.findOne({
      _id: new ObjectId(commentId),
    });

    if (!comment) return null;

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
    };
  }

  async getComments(
    postId: string,
    pageNumber = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortDirection: "asc" | "desc" = "desc",
  ): Promise<CommentsPaginatorApiResponseModel> {
    const filter: RootFilterQuery<CommentDbModel> = {};

    if (postId) {
      filter.postId = postId;
    }

    const comments = await CommentClassModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const postsResponse = comments.map((comment) => {
      return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo.userId,
          userLogin: comment.commentatorInfo.userLogin,
        },
        createdAt: comment.createdAt,
      };
    });
    const commentsCount = await this.getCommentsCount(postId);

    return {
      items: postsResponse,
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: commentsCount,
      pagesCount: commentsCount <= pageSize ? 1 : Math.ceil(commentsCount / Number(pageSize)),
    };
  }

  async getCommentsCount(postId: string) {
    const filter: RootFilterQuery<CommentDbModel> = {};

    if (postId) {
      filter.postId = postId;
    }

    return CommentClassModel.countDocuments(filter);
  }
}
