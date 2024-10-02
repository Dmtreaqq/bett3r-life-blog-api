import { blogsCollection, postsCollection } from "../../db/db";
import { blogsRepository } from "../blogs/blogsRepository";
import { PostDbModel } from "./models/PostDbModel";
import { Filter, ObjectId } from "mongodb";
import { PostApiRequestModel, PostApiResponseModel } from "./models/PostApiModel";

export const postsRepository = {
    async getPosts(blogId?: string, pageNumber: number = 1, pageSize: number = 10, sortBy = 'createdAt', sortDirection: 'asc' | 'desc' = 'desc'): Promise<PostDbModel[]> {
        const filter: Filter<any> = {}

        if (blogId) {
            filter.blogId = blogId
        }

        return postsCollection
            .find(filter)
            .sort(sortBy, sortDirection)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },
    async getPostById(id: string): Promise<PostDbModel | null> {
        return postsCollection.findOne({ _id: new ObjectId(id) });
    },
    async createPost(postInput: PostApiRequestModel): Promise<PostDbModel> {
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

        await postsCollection.insertOne(post)

        return post;
    },
    async updatePostById(newPostDbModel: PostDbModel): Promise<void> {
        await postsCollection.updateOne({
            _id: newPostDbModel._id
        },{
            $set: {
                title: newPostDbModel.title,
                shortDescription: newPostDbModel.shortDescription,
                content: newPostDbModel.content,
                blogId: newPostDbModel.blogId,
                blogName: newPostDbModel.blogName,
                createdAt: newPostDbModel.createdAt
            }
        })
    },
    async deletePostById(id: string): Promise<void> {
        await postsCollection.deleteOne({ _id: new ObjectId(id) })
    },
    async deleteAllPosts(): Promise<void> {
        await postsCollection.deleteMany({})
    },
    async getPostsCount(blogId?: string): Promise<number> {
        const filter: Filter<any> = {}

        if (blogId) {
            filter.blogId = blogId
        }

        return postsCollection.countDocuments(filter)
    },
    fromDbModelToResponseModel(postDbModel: PostDbModel): PostApiResponseModel {
        return {
            id: postDbModel._id.toString(),
            title: postDbModel.title,
            shortDescription: postDbModel.shortDescription,
            content: postDbModel.content,
            blogId: postDbModel.blogId,
            blogName: postDbModel.blogName,
            createdAt: postDbModel.createdAt
        }
    }
}