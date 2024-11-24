import { PostsRepository } from "./repositories/postsRepository";
import { PostDbModel } from "./models/PostDbModel";
import { BlogsRepository } from "../blogs/repositories/blogsRepository";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../common/utils/types";
import { PostApiResponseModel } from "./models/PostApiResponseModel";
import { PostApiRequestModel } from "./models/PostApiRequestModel";

export class PostsService {
  private blogsRepository: BlogsRepository;
  private postsRepository: PostsRepository;
  constructor() {
    this.blogsRepository = new BlogsRepository();
    this.postsRepository = new PostsRepository();
  }

  async createPost(postInput: PostApiRequestModel): Promise<string> {
    const blog = await this.blogsRepository.getBlogById(postInput.blogId);

    if (!blog) {
      throw new ApiError(
        HTTP_STATUSES.BAD_REQUEST_400,
        `Blog ${postInput.blogId} not found`,
        "blogId",
      );
    }

    const post = new PostDbModel(
      postInput.title,
      postInput.shortDescription,
      postInput.content,
      postInput.blogId,
      blog.name,
      new Date().toISOString(),
    );

    return this.postsRepository.createPost(post);
  }

  async updatePost(postId: string, post: PostApiRequestModel): Promise<boolean> {
    const foundPost = await this.postsRepository.getPostById(postId);
    if (!foundPost) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    const newPost: PostApiResponseModel = { ...foundPost, ...post, id: postId };

    return this.postsRepository.updatePostById(newPost);
  }

  async deletePostById(postId: string): Promise<boolean> {
    const foundPost = await this.postsRepository.getPostById(postId);
    if (!foundPost) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    return this.postsRepository.deletePostById(postId);
  }
}
