import { postsCollection } from "../../../db/db";
import { PostDbModel } from "../models/PostDbModel";
import { ObjectId } from "mongodb";
import { PostApiResponseModel } from "../models/PostApiModel";

export const postsRepository = {
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
    async deletePostById(id: string): Promise<boolean> {
        await postsCollection.deleteOne({ _id: new ObjectId(id) })

        return true
    },
    async deleteAllPosts(): Promise<void> {
        await postsCollection.deleteMany({})
    },
    async getPosts(blogId: string, pageNumber: number = 1, pageSize: number = 10, sortBy = 'createdAt', sortDirection: 'asc' | 'desc' = 'desc'): Promise<void> {
        // TODO: Implement if we need to return model that differs from PostApiResponseModel
        // TODO: Please use postsQueryRepository.ts
    },
    async getPostById(id: string): Promise<PostDbModel | null> {
        const post = await postsCollection.findOne({ _id: new ObjectId(id) })

        if (!post) return null

        return {
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt
        }
    }
}
