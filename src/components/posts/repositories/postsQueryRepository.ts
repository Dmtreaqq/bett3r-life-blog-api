import { ObjectId, WithId } from "mongodb";
import { PostDbModel } from "../models/PostDbModel";
import { PostModelClass } from "../../../common/db/models/Post";
import { RootFilterQuery } from "mongoose";
import { PostApiResponseModel } from "../models/PostApiResponseModel";
import { PostsPaginatorApiResponseModel } from "../models/PostsPaginatorApiResponseModel";
import { PostReaction } from "../../users/models/UserDbModel";
import { JwtAuthService } from "../../../common/services/jwtService";
import { UserModelClass } from "../../../common/db/models/User";
import { JwtPayload } from "jsonwebtoken";
import { injectable } from "inversify";

@injectable()
export class PostsQueryRepository {
  private jwtAuthService: JwtAuthService;
  constructor() {
    this.jwtAuthService = new JwtAuthService();
  }

  async getPostById(id: string, accessToken?: string): Promise<PostApiResponseModel | null> {
    const post = await PostModelClass.findOne({ _id: new ObjectId(id) });

    if (!post) return null;

    return this._mapFromDbModelToResponseModel(post, accessToken);
  }

  async getPosts(
    blogId: string,
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy = "createdAt",
    sortDirection: "asc" | "desc" = "desc",
    accessToken?: string,
  ): Promise<PostsPaginatorApiResponseModel> {
    const filter: RootFilterQuery<PostDbModel> = {};

    if (blogId) {
      filter.blogId = blogId;
    }

    const posts = await PostModelClass.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    let postReactions: PostReaction[];
    try {
      const { id: userId } = this.jwtAuthService.decodeToken(accessToken!) as JwtPayload;
      const user = await UserModelClass.findOne({
        _id: new ObjectId(userId),
      });
      postReactions = user!.postReactions;
    } catch {
      postReactions = [];
    }

    const postsResponse = posts.map((post) => {
      const status = postReactions.find((p) => p.postId === post._id.toString())?.status;

      return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        blogName: post.blogName,
        content: post.content,
        blogId: post.blogId,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.likesInfo.likesCount,
          dislikesCount: post.likesInfo.dislikesCount,
          myStatus: status ?? "None",
          newestLikes: post.likesDetails.slice(-3).reverse(),
        },
      };
    });
    const postsCount = await this.getPostsCount(blogId);

    return {
      items: postsResponse,
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: postsCount,
      pagesCount: postsCount <= pageSize ? 1 : Math.ceil(postsCount / Number(pageSize)),
    };
  }

  async getPostsCount(blogId: string): Promise<number> {
    const filter: RootFilterQuery<PostDbModel> = {};

    if (blogId) {
      filter.blogId = blogId;
    }

    return PostModelClass.countDocuments(filter);
  }

  async _mapFromDbModelToResponseModel(
    postDbModel: WithId<PostDbModel>,
    accessToken?: string,
  ): Promise<PostApiResponseModel> {
    let postReaction: PostReaction | undefined;
    try {
      const { id: userId } = this.jwtAuthService.decodeToken(accessToken!) as JwtPayload;
      const user = await UserModelClass.findOne({
        _id: new ObjectId(userId),
      });
      postReaction = user!.postReactions.find(
        (post) => post.postId === postDbModel._id.toString(),
      );
    } catch {
      postReaction = undefined;
    }

    return {
      id: postDbModel._id.toString(),
      title: postDbModel.title,
      shortDescription: postDbModel.shortDescription,
      blogName: postDbModel.blogName,
      content: postDbModel.content,
      blogId: postDbModel.blogId,
      createdAt: postDbModel.createdAt,
      extendedLikesInfo: {
        likesCount: postDbModel.likesInfo.likesCount,
        dislikesCount: postDbModel.likesInfo.dislikesCount,
        myStatus: postReaction?.status ?? "None",
        newestLikes: postDbModel.likesDetails.slice(-3).reverse(),
      },
    };
  }
}
