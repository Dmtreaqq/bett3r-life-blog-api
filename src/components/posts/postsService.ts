import { postsRepository } from "./repositories/postsRepository";
import { PostApiRequestModel, PostApiResponseModel } from "./models/PostApiModel";
import { PostDbModel } from "./models/PostDbModel";
import { blogsRepository } from "../blogs/repositories/blogsRepository";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../common/utils/types";

export const postsService = {
  async createPost(postInput: PostApiRequestModel): Promise<string> {
    const blog = await blogsRepository.getBlogById(postInput.blogId);

    if (!blog) {
      throw new ApiError(
        HTTP_STATUSES.BAD_REQUEST_400,
        `Blog ${postInput.blogId} not found`,
        "blogId",
      );
    }

    const post: PostDbModel = {
      title: postInput.title,
      shortDescription: postInput.shortDescription,
      content: postInput.content,
      blogId: postInput.blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    };

    return postsRepository.createPost(post);
  },

  async updatePost(postId: string, post: PostApiRequestModel): Promise<boolean> {
    const foundPost = await postsRepository.getPostById(postId);
    if (!foundPost) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    const newPost: PostApiResponseModel = { ...foundPost, ...post, id: postId };

    return postsRepository.updatePostById(newPost);
  },

  async deletePostById(postId: string): Promise<boolean> {
    const foundPost = await postsRepository.getPostById(postId);
    if (!foundPost) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    return postsRepository.deletePostById(postId);
  },
};
