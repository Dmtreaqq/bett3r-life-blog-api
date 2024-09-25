import { postsDB } from "./db";
import { PostInputModel, PostViewModel } from "../models/PostModel";
import { randomUUID } from "crypto";
import { blogsRepository } from "./blogsInMemoryRepository";

export const postsRepository = {
    getPosts() {
        return postsDB;
    },
    getPostById(id: string): PostViewModel | undefined {
        return postsDB.find(post => post.id === id);
    },
    createPost(postInput: PostInputModel): PostViewModel {
        const blogName = blogsRepository.getBlogById(postInput.blogId)!.name;

        const post: PostViewModel = {
            id: randomUUID(),
            title: postInput.title,
            shortDescription: postInput.shortDescription,
            content: postInput.content,
            blogId: postInput.blogId,
            blogName: blogName,
            createdAt: new Date().toISOString(),
        }

        postsDB.push(post)

        return post;
    },
    updatePostById(newPostInput: PostViewModel): void {
        postsDB.forEach((post, index) => {
            if (post.id === newPostInput.id) {
                postsDB[index] = newPostInput
            }
        })
    },
    deletePostById(id: string): void {
        const foundPostIndex = postsDB.findIndex(post => post.id === id);
        postsDB.splice(foundPostIndex, 1);
    }
}