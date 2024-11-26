import { commentsRepository } from "../repositories/commentsRepository";
import { ApiError } from "../../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../../common/utils/types";
import { CommentDbModel } from "../models/CommentDbModel";
import { PostsRepository } from "../../posts/repositories/postsRepository";
import { UsersRepository } from "../../users/repositories/usersRepository";
import { CommentApiRequestModel } from "../models/CommentApiRequestModel";

export class CommentsService {
  private postsRepository: PostsRepository;
  private usersRepository: UsersRepository;
  constructor() {
    this.postsRepository = new PostsRepository();
    this.usersRepository = new UsersRepository();
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

    return commentsRepository.createComment(commentDbModel);
  }

  async deleteCommentById(commentId: string, userId: string): Promise<boolean> {
    const comment = await commentsRepository.getCommentById(commentId);

    if (!comment) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    if (comment.commentatorInfo.userId !== userId) {
      throw new ApiError(HTTP_STATUSES.FORBIDDEN_403);
    }

    return commentsRepository.deleteCommentById(commentId);
  }

  async updateCommentById(
    commentId: string,
    content: string,
    userId: string,
  ): Promise<boolean> {
    const comment = await commentsRepository.getCommentById(commentId);

    if (!comment) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    if (comment.commentatorInfo.userId !== userId) {
      throw new ApiError(HTTP_STATUSES.FORBIDDEN_403);
    }

    return commentsRepository.updateCommentById(commentId, content);
  }
}
