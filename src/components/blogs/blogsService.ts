import { BlogApiRequestModel, BlogApiResponseModel } from "./models/BlogApiModel";
import { blogsRepository } from "./blogsRepository";
import { BlogDbModel } from "./models/BlogDbModel";
import { PostApiRequestModel, PostApiResponseModel, PostsApiResponseModel } from "../posts/models/PostApiModel";
import { postsRepository } from "../posts/postsRepository";
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

    async getPostsByBlogId(id: string, pageNumber = 1, pageSize = 10, sortBy: string, sortDirection: 'asc' | 'desc' = 'desc'): Promise<PostsApiResponseModel> {
        const posts = await postsRepository.getPosts(id, Number(pageNumber), Number(pageSize), sortBy, sortDirection)
        const postsCount = await postsRepository.getPostsCount(id);

        const result: PostsApiResponseModel = {
            items: posts,
            page: Number(pageNumber) || 1,
            pageSize: Number(pageSize) || 10,
            totalCount: postsCount,
            pagesCount: postsCount <= 10 ? 1 : Math.ceil(postsCount / Number(pageSize)),
        }

        return result;
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
