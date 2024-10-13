import { BlogApiRequestModel, BlogApiResponseModel, BlogsApiResponseModel } from "./models/BlogApiModel";
import { ObjectId } from "mongodb";
import { blogsRepository } from "./blogsRepository";
import { BlogDbModel } from "./models/BlogDbModel";
import { PostApiRequestModel, PostApiResponseModel, PostsApiResponseModel } from "../posts/models/PostApiModel";
import { postsRepository } from "../posts/postsRepository";
import { postsService } from "../posts/postsService";


export const blogsService = {
    async getBlogs(searchNameTerm: string, pageSize = 10, pageNumber = 1, sortBy = 'createdAt', sortDirection: 'asc' | 'desc' = 'desc'): Promise<BlogsApiResponseModel> {
        const blogsCount = await blogsRepository.getBlogsCount(searchNameTerm)
        const blogs = await blogsRepository.getBlogs(
            searchNameTerm,
            pageSize,
            pageNumber,
            sortBy,
            sortDirection
        )

        const result: BlogsApiResponseModel = {
            items: blogs,
            page: pageNumber,
            pageSize,
            totalCount: blogsCount,
            pagesCount: blogsCount <= 10 ? 1 : Math.ceil(blogsCount / pageSize),
        }

        return result
    },

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

    async getBlogById(id: string): Promise<BlogApiResponseModel | null> {
        const blog = await blogsRepository.getBlogById(id)
        if (!blog) {
            return null;
        }

        return blog;
    },

    async updateBlog(blog: BlogApiResponseModel): Promise<void> {
        await blogsRepository.updateBlogById(blog);
    },

    async getPostsByBlogId(id: string, pageNumber = 1, pageSize = 10, sortBy: string, sortDirection: 'asc' | 'desc' = 'desc'): Promise<PostsApiResponseModel> {
        const posts = await postsRepository.getPosts(id, Number(pageNumber), Number(pageSize), sortBy, sortDirection)
        const postsCount = await postsRepository.getPostsCount(id);

        const apiModelPosts = posts.map(postsRepository.fromDbModelToResponseModel);

        const result: PostsApiResponseModel = {
            items: apiModelPosts,
            page: Number(pageNumber) || 1,
            pageSize: Number(pageSize) || 10,
            totalCount: postsCount,
            pagesCount: postsCount <= 10 ? 1 : Math.ceil(postsCount / Number(pageSize)),
        }

        return result;
    },

    async createPostForBlog(post: PostApiRequestModel): Promise<PostApiResponseModel> {
        const postFromBody = await postsService.createPost(post);

        return postFromBody;
    },

    async deleteBlogById(id: string): Promise<void> {
        await blogsRepository.deleteBlogById(id);
    }
}