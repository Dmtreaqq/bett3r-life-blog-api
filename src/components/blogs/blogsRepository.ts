import { blogsCollection } from "../../db/db";
import { BlogApiResponseModel } from "./models/BlogApiModel";
import { BlogDbModel } from "./models/BlogDbModel";
import { Filter, ObjectId } from "mongodb";

export const blogsRepository = {
    async getBlogs(name: string, pageSize: number, pageNumber: number, sortBy: string, sortDirection: 'asc' | 'desc'): Promise<BlogApiResponseModel[]> {
        const filter: Filter<BlogDbModel> = {}

        if (name !== undefined) {
            filter.name = { $regex: name, $options: 'i' }
        }

        const blogs = await blogsCollection
            .find(filter)
            .sort(sortBy, sortDirection)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()

        return blogs.map(blog => ({
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            isMembership: blog.isMembership,
            createdAt: blog.createdAt
        }))
            
    },
    async getBlogById(id: string): Promise<BlogApiResponseModel | null> {
        const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
        if (!blog) return null;

        return {
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            isMembership: blog.isMembership,
            createdAt: blog.createdAt
        }
    },
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
    async getBlogsCount(name: string): Promise<number> {
        const filter: Filter<any> = {}

        if (name !== undefined) {
            filter.name = { $regex: name, $options: 'i' }
        }

        return blogsCollection.countDocuments(filter)
    }
}
