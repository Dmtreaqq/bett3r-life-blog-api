import { postsRepository } from "./repositories/postsRepository";
import { PostApiRequestModel, PostApiResponseModel } from "./models/PostApiModel";
import { PostDbModel } from "./models/PostDbModel";
import {blogsQueryRepository} from "../blogs/repositories/blogsQueryRepository";

export const postsService = {
    async createPost(postInput: PostApiRequestModel): Promise<PostApiResponseModel | null> {
        const blog = await blogsQueryRepository.getBlogById(postInput.blogId)

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
