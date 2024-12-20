import { CommentsPaginatorApiResponseModel } from "../models/CommentsPaginatorApiResponseModel";
import { ObjectId } from "mongodb";
import { CommentDbModel } from "../models/CommentDbModel";
import { CommentClassModel } from "../../../common/db/models/Comment";
import { RootFilterQuery } from "mongoose";
import { CommentApiResponseModel } from "../models/CommentApiResponseModel";
import { UserModelClass } from "../../../common/db/models/User";
import { JwtPayload } from "jsonwebtoken";
import { JwtAuthService } from "../../../common/services/jwtService";
import { CommentReaction } from "../../users/models/UserDbModel";
import { injectable } from "inversify";

@injectable()
export class CommentsQueryRepository {
  private jwtAuthService: JwtAuthService;

  constructor() {
    this.jwtAuthService = new JwtAuthService();
  }

  async getCommentById(
    commentId: string,
    accessToken?: string,
  ): Promise<CommentApiResponseModel | null> {
    const comment = await CommentClassModel.findOne({
      _id: new ObjectId(commentId),
    });

    if (!comment) return null;

    let commentReaction: CommentReaction | undefined;
    try {
      const { id: userId } = this.jwtAuthService.decodeToken(accessToken!) as JwtPayload;
      const user = await UserModelClass.findOne({
        _id: new ObjectId(userId),
      });
      commentReaction = user!.commentReactions.find(
        (comment) => comment.commentId === commentId,
      );
    } catch {
      commentReaction = undefined;
    }

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: commentReaction?.status ?? "None",
      },
    };
  }

  async getComments(
    postId: string,
    pageNumber = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortDirection: "asc" | "desc" = "desc",
    accessToken?: string,
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

    let commentReactions: CommentReaction[];
    try {
      const { id: userId } = this.jwtAuthService.decodeToken(accessToken!) as JwtPayload;
      const user = await UserModelClass.findOne({
        _id: new ObjectId(userId),
      });
      commentReactions = user!.commentReactions;
    } catch {
      commentReactions = [];
    }

    const postsResponse = comments.map((comment) => {
      const status = commentReactions.find(
        (comm) => comm.commentId === comment._id.toString(),
      )?.status;
      return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo.userId,
          userLogin: comment.commentatorInfo.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likesInfo.likesCount,
          dislikesCount: comment.likesInfo.dislikesCount,
          myStatus: status ?? "None",
        },
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
