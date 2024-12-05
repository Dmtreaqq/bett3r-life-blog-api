import { PostsRepository } from "./repositories/postsRepository";
import { PostDbModel } from "./models/PostDbModel";
import { BlogsRepository } from "../blogs/repositories/blogsRepository";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../common/utils/types";
import { PostApiResponseModel } from "./models/PostApiResponseModel";
import { PostApiRequestModel } from "./models/PostApiRequestModel";
import { UsersRepository } from "../users/repositories/usersRepository";
import { ReactionEnum } from "../users/models/UserDbModel";
import { injectable } from "inversify";

@injectable()
export class PostsService {
  private usersRepository: UsersRepository;
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {
    this.usersRepository = new UsersRepository();
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
      {
        likesCount: 0,
        dislikesCount: 0,
      },
      [],
    );

    return this.postsRepository.createPost(post);
  }

  async updatePost(postId: string, post: PostApiRequestModel): Promise<boolean> {
    const foundPost = await this.postsRepository.getPostById(postId);
    if (!foundPost) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newPost = { ...foundPost, ...post, id: postId } as any;

    return this.postsRepository.updatePostById(newPost);
  }

  async deletePostById(postId: string): Promise<boolean> {
    const foundPost = await this.postsRepository.getPostById(postId);
    if (!foundPost) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    return this.postsRepository.deletePostById(postId);
  }

  async updateLikesOnPostById(postId: string, op: string, userId: string) {
    const comment = await this.postsRepository.getPostById(postId);

    if (!comment) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404);
    }

    const user = await this.usersRepository.getUserById(userId);

    if (!user) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400);
    }

    const posts = user.postReactions;
    const postObject = posts.find((post) => post.postId === postId);
    if (!postObject) {
      if (op === "Like") {
        await this.postsRepository.updateLikesOnPostById(
          postId,
          comment.likesInfo.likesCount,
          ReactionEnum.Like,
          userId,
          user.login,
        );

        await this.usersRepository.createPostLikesInfo(userId, postId, ReactionEnum.Like);
        return;
      } else if (op === "Dislike") {
        await this.postsRepository.updateDislikesOnPostById(
          postId,
          comment.likesInfo.dislikesCount,
          ReactionEnum.Dislike,
        );

        await this.usersRepository.createPostLikesInfo(userId, postId, ReactionEnum.Dislike);

        return;
      } else {
        return;
      }
    }

    const { status } = postObject;

    if (status === op) {
      return;
    }

    if (status === ReactionEnum.Like && op === ReactionEnum.Dislike) {
      await this.postsRepository.updateLikesOnPostById(
        postId,
        comment.likesInfo.likesCount,
        ReactionEnum.Dislike,
        userId,
        user.login,
      );

      await this.postsRepository.updateDislikesOnPostById(
        postId,
        comment.likesInfo.dislikesCount,
        ReactionEnum.Dislike,
      );

      await this.usersRepository.updatePostLikesInfo(userId, postId, ReactionEnum.Dislike);

      return;
    }

    if (status === ReactionEnum.Dislike && op === ReactionEnum.Like) {
      await this.postsRepository.updateDislikesOnPostById(
        postId,
        comment.likesInfo.dislikesCount,
        ReactionEnum.Like,
      );

      await this.postsRepository.updateLikesOnPostById(
        postId,
        comment.likesInfo.likesCount,
        ReactionEnum.Like,
        userId,
        user.login,
      );

      await this.usersRepository.updatePostLikesInfo(userId, postId, ReactionEnum.Like);

      return;
    }

    if (status === ReactionEnum.Like && op === "None") {
      await this.postsRepository.updateLikesOnPostById(
        postId,
        comment.likesInfo.likesCount,
        ReactionEnum.Dislike,
        userId,
        user.login,
      );

      await this.usersRepository.deletePostReaction(userId, postId);

      return;
    }

    if (status === ReactionEnum.Dislike && op === "None") {
      await this.postsRepository.updateDislikesOnPostById(
        postId,
        comment.likesInfo.dislikesCount,
        ReactionEnum.Like,
      );

      await this.usersRepository.deletePostReaction(userId, postId);

      return;
    }
  }
}
