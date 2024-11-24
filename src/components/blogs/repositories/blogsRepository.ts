import { BlogModelClass } from "../../../common/db/models/Blog";
import { BlogApiResponseModel } from "../models/BlogApiResponseModel";
import { BlogDbModel } from "../models/BlogDbModel";
import { ObjectId } from "mongodb";

class BlogsRepository {
  async createBlog(blogInput: BlogDbModel): Promise<string> {
    const result = await BlogModelClass.create(blogInput);

    return result._id.toString();
  }

  async updateBlogById(blogResponseModel: BlogApiResponseModel): Promise<boolean> {
    await BlogModelClass.updateOne(
      {
        _id: new ObjectId(blogResponseModel.id),
      },
      {
        $set: {
          name: blogResponseModel.name,
          description: blogResponseModel.description,
          websiteUrl: blogResponseModel.websiteUrl,
          isMembership: blogResponseModel.isMembership,
          createdAt: blogResponseModel.createdAt,
        },
      },
    );

    return true;
  }

  async deleteBlogById(id: string): Promise<boolean> {
    await BlogModelClass.deleteOne({ _id: new ObjectId(id) });

    return true;
  }
  async deleteAllBlogs(): Promise<void> {
    await BlogModelClass.deleteMany({});
    return;
  }

  async getBlogById(id: string): Promise<BlogDbModel | null> {
    const blog = await BlogModelClass.findOne(
      { _id: new ObjectId(id) },
      { projection: { _id: 0 } },
    );

    if (!blog) return null;

    return blog;
  }
}

export const blogsRepository = new BlogsRepository();
