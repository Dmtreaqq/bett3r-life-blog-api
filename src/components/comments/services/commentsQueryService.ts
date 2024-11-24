import { CommentsPaginatorApiResponseModel } from "../models/CommentsPaginatorApiResponseModel";
import { postsQueryRepository } from "../../posts/repositories/postsQueryRepository";
import { ApiError } from "../../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../../common/utils/types";
import { commentsQueryRepository } from "../repositories/commentsQueryRepository";

class CommentsQueryService {
  async getCommentsForPost(
    postId: string,
    pageNumber = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortDirection: "asc" | "desc" = "desc",
  ): Promise<CommentsPaginatorApiResponseModel> {
    const post = await postsQueryRepository.getPostById(postId);
    if (!post) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    return commentsQueryRepository.getComments(
      postId,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
  }
}

export const commentsQueryService = new CommentsQueryService();
