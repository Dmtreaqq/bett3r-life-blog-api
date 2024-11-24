import { BlogApiRequestModel } from "./models/BlogApiRequestModel";
import { BlogsRepository } from "./repositories/blogsRepository";
import { BlogDbModel } from "./models/BlogDbModel";
import { HTTP_STATUSES } from "../../common/utils/types";
import { ApiError } from "../../common/utils/ApiError";
import { PostDbModel } from "../posts/models/PostDbModel";
import { PostsRepository } from "../posts/repositories/postsRepository";
import { PostApiRequestModel } from "../posts/models/PostApiRequestModel";

export class BlogsService {
  private blogsRepository: BlogsRepository;
  private postsRepository: PostsRepository;
  constructor() {
    this.blogsRepository = new BlogsRepository();
    this.postsRepository = new PostsRepository();
  }

  async createBlog(blogInput: BlogApiRequestModel): Promise<string> {
    const blog = new BlogDbModel(
      blogInput.name,
      blogInput.description,
      blogInput.websiteUrl,
      false,
      new Date().toISOString(),
    );

    return this.blogsRepository.createBlog(blog);
  }

  async updateBlogById(blogId: string, blog: BlogApiRequestModel): Promise<boolean> {
    const foundBlog = await this.blogsRepository.getBlogById(blogId);
    if (!foundBlog) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    const newBlog = { ...foundBlog, ...blog, id: blogId };

    return this.blogsRepository.updateBlogById(newBlog);
  }

  async createPostForBlog(postInput: PostApiRequestModel): Promise<string> {
    const blog = await this.blogsRepository.getBlogById(postInput.blogId);

    if (!blog) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    const post: PostDbModel = {
      title: postInput.title,
      shortDescription: postInput.shortDescription,
      content: postInput.content,
      blogId: postInput.blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    };

    return this.postsRepository.createPost(post);
  }

  async deleteBlogById(blogId: string): Promise<boolean> {
    const foundBlog = await this.blogsRepository.getBlogById(blogId);
    if (!foundBlog) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    return this.blogsRepository.deleteBlogById(blogId);
  }
}
