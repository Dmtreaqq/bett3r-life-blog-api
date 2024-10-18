import {BlogApiRequestModel, BlogApiResponseModel} from "./models/BlogApiModel";
import {blogsRepository} from "./repositories/blogsRepository";
import {BlogDbModel} from "./models/BlogDbModel";
import {PostApiRequestModel, PostApiResponseModel} from "../posts/models/PostApiModel";
import {postsService} from "../posts/postsService";
import {HTTP_STATUSES} from "../../utils/types";
import {ApiError} from "../../utils/ApiError";

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

    async updateBlogById(blogId: string, blog: BlogApiRequestModel): Promise<void> {
        const foundBlog = await blogsRepository.getBlogById(blogId)
        if (!foundBlog) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        const newBlog = { ...foundBlog, ...blog, id: blogId };

        await blogsRepository.updateBlogById(newBlog);
    },

    // TODO изменить
    async createPostForBlog(blogId: string, post: PostApiRequestModel): Promise<PostApiResponseModel | null> {
        const postFromBody = await postsService.createPost(post);

        if (!postFromBody) return null

        return postFromBody;
    },

    async deleteBlogById(blogId: string): Promise<void> {
        const foundBlog = await blogsRepository.getBlogById(blogId)
        if (!foundBlog) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        await blogsRepository.deleteBlogById(blogId);
    }
}
