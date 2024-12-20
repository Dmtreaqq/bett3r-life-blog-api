import { CommentsPaginatorApiResponseModel } from "../models/CommentsPaginatorApiResponseModel";
import { PostsQueryRepository } from "../../posts/repositories/postsQueryRepository";
import { ApiError } from "../../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../../common/utils/types";
import { CommentsQueryRepository } from "../repositories/commentsQueryRepository";
import { injectable } from "inversify";

@injectable()
export class CommentsQueryService {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async getCommentsForPost(
    postId: string,
    pageNumber = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortDirection: "asc" | "desc" = "desc",
    accessToken?: string,
  ): Promise<CommentsPaginatorApiResponseModel> {
    const post = await this.postsQueryRepository.getPostById(postId);
    if (!post) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    return this.commentsQueryRepository.getComments(
      postId,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      accessToken,
    );
  }
}
