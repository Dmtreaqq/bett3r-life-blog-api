import { ObjectId, WithId } from "mongodb";
import { PostDbModel } from "../models/PostDbModel";
import { PostModelClass } from "../../../common/db/models/Post";
import { RootFilterQuery } from "mongoose";
import { PostApiResponseModel } from "../models/PostApiResponseModel";
import { PostsPaginatorApiResponseModel } from "../models/PostsPaginatorApiResponseModel";

class PostsQueryRepository {
  async getPostById(id: string): Promise<PostApiResponseModel | null> {
    const post = await PostModelClass.findOne({ _id: new ObjectId(id) });

    if (!post) return null;

    return this._mapFromDbModelToResponseModel(post);
  }

  async getPosts(
    blogId: string,
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy = "createdAt",
    sortDirection: "asc" | "desc" = "desc",
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

    const postsResponse = posts.map((post) => this._mapFromDbModelToResponseModel(post));
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

  _mapFromDbModelToResponseModel(postDbModel: WithId<PostDbModel>): PostApiResponseModel {
    return {
      id: postDbModel._id.toString(),
      title: postDbModel.title,
      shortDescription: postDbModel.shortDescription,
      blogName: postDbModel.blogName,
      content: postDbModel.content,
      blogId: postDbModel.blogId,
      createdAt: postDbModel.createdAt,
    };
  }
}

export const postsQueryRepository = new PostsQueryRepository();
