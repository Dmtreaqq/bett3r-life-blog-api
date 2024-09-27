import { randomUUID } from 'crypto';
import { blogsCollection } from "./db";
import { BlogInputModel, BlogViewModel } from "../models/BlogModel";

export const blogsRepository = {
    async getBlogs(): Promise<BlogViewModel[]> {
        return blogsCollection.find({}, { projection: { _id: 0 }}).toArray()
    },
    async getBlogById(id: string): Promise<BlogViewModel | null> {
        return blogsCollection.findOne({ id }, { projection: { _id: 0 } });
    },
    async createBlog(blogInput: BlogInputModel): Promise<BlogViewModel> {
        const blog: BlogViewModel = {
            id: randomUUID(),
            name: blogInput.name,
            description: blogInput.description,
            websiteUrl: blogInput.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }

        await blogsCollection.insertOne({ ...blog })

        return blog;
    },
    async updateBlogById(newBlogInput: BlogViewModel): Promise<void> {
        await blogsCollection.replaceOne({ id: newBlogInput.id }, newBlogInput)
    },
    async deleteBlogById(id: string): Promise<void> {
        await blogsCollection.deleteOne({ id })
    },
    async deleteAllBlogs(): Promise<void> {
        await blogsCollection.deleteMany({})
    }
}