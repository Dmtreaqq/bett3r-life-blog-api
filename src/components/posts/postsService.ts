import { postsRepository } from "./postsRepository";
import { PostApiRequestModel, PostApiResponseModel, PostsApiResponseModel } from "./models/PostApiModel";
import { blogsRepository } from "../blogs/blogsRepository";
import { ObjectId } from "mongodb";
import { PostDbModel } from "./models/PostDbModel";

export const postsService = {
    async getPosts(blogId: string, pageNumber: number, pageSize: number, sortBy: string, sortDirection: 'asc' | 'desc') {
        const posts = await postsRepository.getPosts(
            blogId,
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        );

        const postsCount = await postsRepository.getPostsCount();
        
        const result: PostsApiResponseModel = {
            items: posts,
            page: Number(pageNumber),
            pageSize: Number(pageSize),
            totalCount: postsCount,
            pagesCount: postsCount <= 10 ? 1 : Math.ceil(postsCount / Number(pageSize)),
        }

        return result
    },

    async getPostById(id: string) {
        const foundPost = await postsRepository.getPostById(id);

        if(!foundPost) return null;

        return foundPost
    },

    async createPost(postInput: PostApiRequestModel): Promise<PostApiResponseModel | null> {
        const blog = await blogsRepository.getBlogById(postInput.blogId)

        if (!blog) return null

        const post: PostDbModel = {
            title: postInput.title,
            shortDescription: postInput.shortDescription,
            content: postInput.content,
            blogId: postInput.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }

        const postId = await postsRepository.createPost(post);

        return {
            id: postId,
            title: post.title,
            shortDescription: post.shortDescription,
            blogId: post.blogId,
            blogName: post.blogName,
            content: post.content,
            createdAt: post.createdAt
        }
    },

    async updatePost(post: PostApiResponseModel): Promise<void> {
        await postsRepository.updatePostById(post)
    },

    async deletePostById(id: string): Promise<void> {
        await postsRepository.deletePostById(id);
    }
}