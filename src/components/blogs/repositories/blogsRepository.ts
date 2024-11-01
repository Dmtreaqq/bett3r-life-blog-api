import { blogsCollection } from "../../../common/db/db";
import { BlogApiResponseModel } from "../models/BlogApiModel";
import { BlogDbModel } from "../models/BlogDbModel";
import { ObjectId } from "mongodb";

export const blogsRepository = {
  async createBlog(blogInput: BlogDbModel): Promise<string> {
    const result = await blogsCollection.insertOne(blogInput);

    return result.insertedId.toString();
  },
  async updateBlogById(blogResponseModel: BlogApiResponseModel): Promise<boolean> {
    await blogsCollection.updateOne(
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
  },
  async deleteBlogById(id: string): Promise<boolean> {
    await blogsCollection.deleteOne({ _id: new ObjectId(id) });

    return true;
  },
  async deleteAllBlogs(): Promise<void> {
    await blogsCollection.deleteMany({});
  },
  async getBlogById(id: string): Promise<BlogDbModel | null> {
    const blog = await blogsCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { _id: 0 } },
    );

    if (!blog) return null;

    return blog;
  },
};
