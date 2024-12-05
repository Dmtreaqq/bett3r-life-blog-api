import { BlogApiResponseModel } from "../models/BlogApiResponseModel";
import { BlogsPaginatorApiResponseModel } from "../models/BlogsPaginatorApiResponseModel";
import { BlogModelClass } from "../../../common/db/models/Blog";
import { BlogDbModel } from "../models/BlogDbModel";
import { ObjectId, WithId } from "mongodb";
import { RootFilterQuery } from "mongoose";
import { injectable } from "inversify";

@injectable()
export class BlogsQueryRepository {
  async getBlogById(id: string): Promise<BlogApiResponseModel | null> {
    const blog = await BlogModelClass.findOne({ _id: new ObjectId(id) });

    if (!blog) return null;

    return this._mapFromDbModelToResponseModel(blog);
  }

  async getBlogs(
    name: string = "",
    pageSize: number = 10,
    pageNumber: number = 1,
    sortBy: string = "createdAt",
    sortDirection: "asc" | "desc" = "desc",
  ): Promise<BlogsPaginatorApiResponseModel> {
    const filter: RootFilterQuery<BlogDbModel> = {};

    if (name !== undefined) {
      filter.name = { $regex: name, $options: "i" };
    }

    const blogs = await BlogModelClass.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const blogsCount = await this.getBlogsCount(name);
    const blogsResponse = blogs.map((blog) => this._mapFromDbModelToResponseModel(blog));

    return {
      items: blogsResponse,
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      pagesCount: blogsCount <= pageSize ? 1 : Math.ceil(blogsCount / pageSize),
    };
  }

  async getBlogsCount(name: string): Promise<number> {
    const filter: RootFilterQuery<BlogDbModel> = {};

    if (name !== undefined) {
      filter.name = { $regex: name, $options: "i" };
    }

    return BlogModelClass.countDocuments(filter);
  }

  _mapFromDbModelToResponseModel(blogDbModel: WithId<BlogDbModel>): BlogApiResponseModel {
    return {
      id: blogDbModel._id.toString(),
      name: blogDbModel.name,
      description: blogDbModel.description,
      websiteUrl: blogDbModel.websiteUrl,
      isMembership: blogDbModel.isMembership,
      createdAt: blogDbModel.createdAt,
    };
  }
}
