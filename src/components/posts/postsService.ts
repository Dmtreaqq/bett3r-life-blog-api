import { postsRepository } from "./postsRepository";
import { PostApiRequestModel, PostApiResponseModel, PostsApiResponseModel } from "./models/PostApiModel";
import { blogsRepository } from "../blogs/blogsRepository";
import { ObjectId } from "mongodb";

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
        const apiModelPosts = posts.map(postsRepository.fromDbModelToResponseModel);

        const result: PostsApiResponseModel = {
            items: apiModelPosts,
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

        const apiModelPost = postsRepository.fromDbModelToResponseModel(foundPost);

        return apiModelPost
    },

    async createPost(postInput: PostApiRequestModel): Promise<PostApiResponseModel> {
        const blog = await blogsRepository.getBlogById(postInput.blogId)

        const post = {
            _id: new ObjectId(),
            title: postInput.title,
            shortDescription: postInput.shortDescription,
            content: postInput.content,
            blogId: postInput.blogId,
            blogName: blog!.name,
            createdAt: new Date().toISOString()
        }

        const resultPost = await postsRepository.createPost(post);

        const apiModelPost = postsRepository.fromDbModelToResponseModel(resultPost);

        return apiModelPost
    },

    async updatePost(post: PostApiResponseModel): Promise<void> {
        const mappedPost = postsRepository.fromResponseModelToDbModel(post)

        await postsRepository.updatePostById(mappedPost)
    },

    async deletePostById(id: string): Promise<void> {
        await postsRepository.deletePostById(id);
    }
}