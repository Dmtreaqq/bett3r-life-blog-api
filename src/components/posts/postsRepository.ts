import { postsCollection } from "../../db/db";
import { blogsRepository } from "../blogs/blogsRepository";
import { PostDbModel } from "./models/PostDbModel";
import { Filter, ObjectId } from "mongodb";
import { PostApiRequestModel, PostApiResponseModel } from "./models/PostApiModel";

export const postsRepository = {
    async getPosts(blogId?: string, pageNumber: number = 1, pageSize: number = 10, sortBy = 'createdAt', sortDirection: 'asc' | 'desc' = 'desc'): Promise<PostApiResponseModel[]> {
        const filter: Filter<any> = {}

        if (blogId) {
            filter.blogId = blogId
        }

        const posts = await postsCollection
            .find(filter)
            .sort(sortBy, sortDirection)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()

        return posts.map(post => ({
            id: post._id.toString(),
            blogName: post.blogName,
            content: post.content,
            shortDescription: post.shortDescription,
            title: post.title,
            blogId: post.blogId,
            createdAt: post.createdAt
        }))
    },
    async getPostById(id: string): Promise<PostApiResponseModel | null> {
        const post = await postsCollection.findOne({ _id: new ObjectId(id) });

        if (!post) return null;

        return {
            id: post._id.toString(),
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            title: post.title,
            createdAt: post.createdAt,
            shortDescription: post.shortDescription
        }
    },
    async createPost(postInput: PostDbModel): Promise<string> {
        const result = await postsCollection.insertOne(postInput)

        return result.insertedId.toString();
    },
    async updatePostById(postResponseModel: PostApiResponseModel): Promise<void> {
        await postsCollection.updateOne({
            _id: new ObjectId(postResponseModel.id)
        },{
            $set: {
                title: postResponseModel.title,
                shortDescription: postResponseModel.shortDescription,
                content: postResponseModel.content,
                blogId: postResponseModel.blogId,
                blogName: postResponseModel.blogName,
                createdAt: postResponseModel.createdAt
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
    }
}