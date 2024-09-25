import { randomUUID } from 'crypto';
import { blogsDB } from "./db";
import { BlogInputModel, BlogViewModel } from "../models/BlogModel";

export const blogsRepository = {
    getBlogs() {
        return blogsDB;
    },
    getBlogById(id: string): BlogViewModel | undefined {
        return blogsDB.find(blog => blog.id === id);
    },
    createBlog(blogInput: BlogInputModel): BlogViewModel {
        const post: BlogViewModel = {
            id: randomUUID(),
            name: blogInput.name,
            description: blogInput.description,
            websiteUrl: blogInput.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }

        blogsDB.push(post)

        return post;
    },
    updateBlogById(newBlogInput: BlogViewModel): void {
        blogsDB.forEach((blog, index) => {
            if (blog.id === newBlogInput.id) {
                blogsDB[index] = newBlogInput
            }
        })
    },
    deleteBlogById(id: string): void {
        const foundPostIndex = blogsDB.findIndex(blog => blog.id === id);
        blogsDB.splice(foundPostIndex, 1);
    }
}