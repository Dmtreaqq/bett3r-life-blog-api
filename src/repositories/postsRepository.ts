import { postsCollection } from "./db";
import { PostInputModel, PostViewModel } from "../models/PostModel";
import { randomUUID } from "crypto";
import { blogsRepository } from "./blogsRepository";

export const postsRepository = {
    async getPosts() {
        return postsCollection.find({}, { projection: { _id: 0 }}).toArray()
    },
    async getPostById(id: string): Promise<PostViewModel | null> {
        return postsCollection.findOne({ id }, { projection: { _id: 0 } });
    },
    async createPost(postInput: PostInputModel): Promise<PostViewModel> {
        const blog = await blogsRepository.getBlogById(postInput.blogId)

        const post: PostViewModel = {
            id: randomUUID(),
            title: postInput.title,
            shortDescription: postInput.shortDescription,
            content: postInput.content,
            blogId: postInput.blogId,
            blogName: blog!.name,
            createdAt: new Date().toISOString()
        }

        await postsCollection.insertOne({ ...post })

        return post;
    },
    async updatePostById(newPostInput: PostViewModel): Promise<void> {
        await postsCollection.replaceOne({ id: newPostInput.id }, newPostInput)
    },
    async deletePostById(id: string): Promise<void> {
        await postsCollection.deleteOne({ id })
    },
    async deleteAllPosts(): Promise<void> {
        await postsCollection.deleteMany({})
    }
}