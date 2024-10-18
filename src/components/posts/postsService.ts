import {postsRepository} from "./repositories/postsRepository";
import {PostApiRequestModel, PostApiResponseModel} from "./models/PostApiModel";
import {PostDbModel} from "./models/PostDbModel";
import {blogsRepository} from "../blogs/repositories/blogsRepository";
import {ApiError} from "../../utils/ApiError";
import {HTTP_STATUSES} from "../../utils/types";

export const postsService = {
    async createPost(postInput: PostApiRequestModel): Promise<string | null> {
        const blog = await blogsRepository.getBlogById(postInput.blogId)

        // TODO: тогда нужно убрать проверку с миддлвара, иначе как затестить в Е2Е
        if (!blog) {
            throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, `Blog ${postInput.blogId} not found`, 'blogId')
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

    async updatePost(postId: string, post: PostApiRequestModel): Promise<void> {
        const foundPost = await postsRepository.getPostById(postId);
        if (!foundPost) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        const newPost: PostApiResponseModel = { ...foundPost, ...post, id: postId  };

        await postsRepository.updatePostById(newPost)
    },

    async deletePostById(postId: string): Promise<boolean> {
        const foundPost = await postsRepository.getPostById(postId);
        if (!foundPost) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404)
        }

        return postsRepository.deletePostById(postId);
    }
}
