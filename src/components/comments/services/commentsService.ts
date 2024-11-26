import { CommentsRepository } from "../repositories/commentsRepository";
import { ApiError } from "../../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../../common/utils/types";
import { CommentDbModel } from "../models/CommentDbModel";
import { PostsRepository } from "../../posts/repositories/postsRepository";
import { UsersRepository } from "../../users/repositories/usersRepository";
import { CommentApiRequestModel } from "../models/CommentApiRequestModel";
import { ReactionEnum } from "../../users/models/UserDbModel";

export class CommentsService {
  private postsRepository: PostsRepository;
  private usersRepository: UsersRepository;
  private commentsRepository: CommentsRepository;

  constructor() {
    this.postsRepository = new PostsRepository();
    this.usersRepository = new UsersRepository();
    this.commentsRepository = new CommentsRepository();
  }

  async createComment(
    postId: string,
    comment: CommentApiRequestModel,
    userId: string,
  ): Promise<string> {
    const post = await this.postsRepository.getPostById(postId);

    if (!post) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    const user = await this.usersRepository.getUserById(userId);

    const commentDbModel = new CommentDbModel(
      comment.content,
      {
        userId: userId,
        userLogin: user!.login,
      },
      new Date().toISOString(),
      postId,
      { likesCount: 0, dislikesCount: 0 },
    );

    return this.commentsRepository.createComment(commentDbModel);
  }

  async deleteCommentById(commentId: string, userId: string): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentById(commentId);

    if (!comment) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    if (comment.commentatorInfo.userId !== userId) {
      throw new ApiError(HTTP_STATUSES.FORBIDDEN_403);
    }

    return this.commentsRepository.deleteCommentById(commentId);
  }

  async updateCommentById(
    commentId: string,
    content: string,
    userId: string,
  ): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentById(commentId);

    if (!comment) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    if (comment.commentatorInfo.userId !== userId) {
      throw new ApiError(HTTP_STATUSES.FORBIDDEN_403);
    }

    return this.commentsRepository.updateCommentById(commentId, content);
  }

  async updateLikesOnCommentById(commentId: string, op: string, userId: string) {
    const comment = await this.commentsRepository.getCommentById(commentId);

    if (!comment) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    const user = await this.usersRepository.getUserById(userId);

    const comments = user!.commentReactions;
    const commentObject = comments.find((comm) => comm.commentId === commentId);
    if (!commentObject) {
      if (op === "Like") {
        await this.commentsRepository.updateLikesOnCommentById(
          commentId,
          comment.likesInfo.likesCount,
          ReactionEnum.Like,
        );

        await this.usersRepository.createLikesInfo(userId, commentId, ReactionEnum.Like);
        return;
      } else if (op === "Dislike") {
        await this.commentsRepository.updateDislikesOnCommentById(
          commentId,
          comment.likesInfo.dislikesCount,
          ReactionEnum.Dislike,
        );

        await this.usersRepository.createLikesInfo(userId, commentId, ReactionEnum.Dislike);

        return;
      } else {
        return;
      }
    }

    const { status } = commentObject;

    if (status === op) {
      return;
    }

    if (status === ReactionEnum.Like && op === ReactionEnum.Dislike) {
      await this.commentsRepository.updateLikesOnCommentById(
        commentId,
        comment.likesInfo.likesCount,
        ReactionEnum.Dislike,
      );

      await this.commentsRepository.updateDislikesOnCommentById(
        commentId,
        comment.likesInfo.dislikesCount,
        ReactionEnum.Dislike,
      );

      await this.usersRepository.updateLikesInfo(userId, commentId, ReactionEnum.Dislike);

      return;
    }

    if (status === ReactionEnum.Dislike && op === ReactionEnum.Like) {
      await this.commentsRepository.updateDislikesOnCommentById(
        commentId,
        comment.likesInfo.dislikesCount,
        ReactionEnum.Like,
      );

      await this.commentsRepository.updateLikesOnCommentById(
        commentId,
        comment.likesInfo.likesCount,
        ReactionEnum.Like,
      );

      await this.usersRepository.updateLikesInfo(userId, commentId, ReactionEnum.Like);

      return;
    }

    if (status === ReactionEnum.Like && op === "None") {
      await this.commentsRepository.updateLikesOnCommentById(
        commentId,
        comment.likesInfo.likesCount,
        ReactionEnum.Dislike,
      );

      await this.usersRepository.deleteCommentReaction(userId, commentId);

      return;
    }

    if (status === ReactionEnum.Dislike && op === "None") {
      await this.commentsRepository.updateDislikesOnCommentById(
        commentId,
        comment.likesInfo.dislikesCount,
        ReactionEnum.Like,
      );

      await this.usersRepository.deleteCommentReaction(userId, commentId);

      return;
    }
  }
}
