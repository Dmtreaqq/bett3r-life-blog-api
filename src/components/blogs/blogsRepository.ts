import { blogsCollection } from "../../db/db";
import { BlogApiResponseModel } from "./models/BlogApiModel";
import { BlogDbModel } from "./models/BlogDbModel";
import { Filter, ObjectId } from "mongodb";

export const blogsRepository = {
    async createBlog(blogInput: BlogDbModel): Promise<string> {
        const result = await blogsCollection.insertOne(blogInput);

        return result.insertedId.toString();
    },
    async updateBlogById(blogResponseModel: BlogApiResponseModel): Promise<void> {
        await blogsCollection.updateOne({
            _id: new ObjectId(blogResponseModel.id)
        },
        {
            $set: {
                name: blogResponseModel.name,
                description: blogResponseModel.description,
                websiteUrl: blogResponseModel.websiteUrl,
                isMembership: blogResponseModel.isMembership,
                createdAt: blogResponseModel.createdAt
            }
        })
    },
    async deleteBlogById(id: string): Promise<void> {
        await blogsCollection.deleteOne({ _id: new ObjectId(id) });
    },
    async deleteAllBlogs(): Promise<void> {
        await blogsCollection.deleteMany({})
    },
    async getBlogs(params: any) {
        // TODO: Implement if we need to return Blogs model that differs from BlogApiResponseModel.
        // TODO: Now use blogsQueryRepository.ts
    },
    async getBlogById(id: string) {
        // TODO: Implement if we need to return Blog model that differs from BlogApiResponseModel.
        // TODO: Now use blogsQueryRepository.ts
    }
}
