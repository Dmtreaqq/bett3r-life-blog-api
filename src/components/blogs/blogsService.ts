import { BlogApiRequestModel, BlogApiResponseModel } from "./models/BlogApiModel";
import { blogsRepository } from "./repositories/blogsRepository";
import { BlogDbModel } from "./models/BlogDbModel";
import { PostApiRequestModel, PostApiResponseModel } from "../posts/models/PostApiModel";
import { postsService } from "../posts/postsService";

export const blogsService = {
    async createBlog(blogInput: BlogApiRequestModel): Promise<BlogApiResponseModel> {
        const blog: BlogDbModel = {
            name: blogInput.name,
            description: blogInput.description,
            websiteUrl: blogInput.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }

        const blogId = await blogsRepository.createBlog(blog)

        return {
            id: blogId,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        }
    },

    async updateBlog(blog: BlogApiResponseModel): Promise<void> {
        await blogsRepository.updateBlogById(blog);
    },

    async createPostForBlog(post: PostApiRequestModel): Promise<PostApiResponseModel | null> {
        const postFromBody = await postsService.createPost(post);

        if (!postFromBody) return null

        return postFromBody;
    },

    async deleteBlogById(id: string): Promise<void> {
        await blogsRepository.deleteBlogById(id);
    }
}
