import { blogsDB } from "../db";
import { BlogInputModel, BlogViewModel } from "../models/BlogModel";

let counter = 1;

export const blogsRepository = {
    getBlogById(id: string): BlogViewModel | undefined {
        return blogsDB.find(blog => blog.id === id);
    },
    createBlog(blogInput: BlogInputModel): BlogViewModel {
        const post: BlogViewModel = {
            id: String(counter++),
            name: blogInput.name,
            description: blogInput.description,
            websiteUrl: blogInput.websiteUrl
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