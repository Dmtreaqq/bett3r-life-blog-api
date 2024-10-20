import {BlogApiRequestModel} from "./models/BlogApiModel";
import {blogsRepository} from "./repositories/blogsRepository";
import {BlogDbModel} from "./models/BlogDbModel";
import {PostApiRequestModel} from "../posts/models/PostApiModel";
import {HTTP_STATUSES} from "../../utils/types";
import {ApiError} from "../../utils/ApiError";
import {PostDbModel} from "../posts/models/PostDbModel";
import {postsRepository} from "../posts/repositories/postsRepository";

export const blogsService = {
    async createBlog(blogInput: BlogApiRequestModel): Promise<string> {
        const blog: BlogDbModel = {
            name: blogInput.name,
            description: blogInput.description,
            websiteUrl: blogInput.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }

        return blogsRepository.createBlog(blog)
    },

    async updateBlogById(blogId: string, blog: BlogApiRequestModel): Promise<boolean> {
        const foundBlog = await blogsRepository.getBlogById(blogId)
        if (!foundBlog) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        const newBlog = { ...foundBlog, ...blog, id: blogId };

        return blogsRepository.updateBlogById(newBlog);
    },


    async createPostForBlog(postInput: PostApiRequestModel): Promise<string> {
        const blog = await blogsRepository.getBlogById(postInput.blogId)

        if (!blog) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        const post: PostDbModel = {
            title: postInput.title,
            shortDescription: postInput.shortDescription,
            content: postInput.content,
            blogId: postInput.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }

        return postsRepository.createPost(post);
    },

    async deleteBlogById(blogId: string): Promise<boolean> {
        const foundBlog = await blogsRepository.getBlogById(blogId)
        if (!foundBlog) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        return blogsRepository.deleteBlogById(blogId);
    }
}
