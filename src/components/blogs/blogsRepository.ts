import { blogsCollection } from "../../db/db";
import { BlogApiResponseModel } from "./models/BlogApiModel";
import { BlogDbModel } from "./models/BlogDbModel";
import { Filter, ObjectId } from "mongodb";

export const blogsRepository = {
    async getBlogs(name: string, pageSize: number, pageNumber: number, sortBy: string, sortDirection: 'asc' | 'desc'): Promise<BlogDbModel[]> {
        const filter: Filter<BlogDbModel> = {}

        if (name !== undefined) {
            filter.name = { $regex: name, $options: 'i' }
        }

        return blogsCollection
            .find(filter)
            .sort(sortBy, sortDirection)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },
    async getBlogById(id: string): Promise<BlogDbModel | null> {
        return blogsCollection.findOne({ _id: new ObjectId(id) });
    },
    async createBlog(blogInput: BlogDbModel): Promise<any> {
        await blogsCollection.insertOne(blogInput);

        return blogInput;
    },
    async updateBlogById(newBlogDbModel: BlogDbModel): Promise<void> {
        await blogsCollection.updateOne({
            _id: newBlogDbModel._id
        },
        {
            $set: {
                name: newBlogDbModel.name,
                description: newBlogDbModel.description,
                websiteUrl: newBlogDbModel.websiteUrl,
                isMembership: newBlogDbModel.isMembership,
                createdAt: newBlogDbModel.createdAt
            }
        })
    },
    async deleteBlogById(id: string): Promise<void> {
        await blogsCollection.deleteOne({ _id: new ObjectId(id) });
    },
    async deleteAllBlogs(): Promise<void> {
        await blogsCollection.deleteMany({})
    },
    async getBlogsCount(name: string): Promise<number> {
        const filter: Filter<any> = {}

        if (name !== undefined) {
            filter.name = { $regex: name, $options: 'i' }
        }

        return blogsCollection.countDocuments(filter)
    },
    fromDbModelToResponseModel(blogDbModel: BlogDbModel): BlogApiResponseModel {
        return {
            id: blogDbModel._id.toString(),
            name: blogDbModel.name,
            description: blogDbModel.description,
            websiteUrl: blogDbModel.websiteUrl,
            isMembership: blogDbModel.isMembership,
            createdAt: blogDbModel.createdAt
        }
    },
    fromResponseModelToDbModel(blogResponseModel: BlogApiResponseModel): BlogDbModel {
        return {
            _id: new ObjectId(blogResponseModel.id),
            name: blogResponseModel.name,
            description: blogResponseModel.description,
            websiteUrl: blogResponseModel.websiteUrl,
            isMembership: blogResponseModel.isMembership,
            createdAt: blogResponseModel.createdAt
        }
    }
}