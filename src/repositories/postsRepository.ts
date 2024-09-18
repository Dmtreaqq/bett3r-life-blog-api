import { postsDB } from "../db";
import { PostInputModel, PostViewModel } from "../models/PostModel";

let counter = 1;

export const postsRepository = {
    getPostById(id: string): PostViewModel | undefined {
        return postsDB.find(post => post.id === id);
    },
    createPost(postInput: PostInputModel): PostViewModel {
        const post: PostViewModel = {
            id: String(counter++),
            title: postInput.title,
            shortDescription: postInput.shortDescription,
            content: postInput.content,
            blogId: postInput.blogId,
            blogName: '???'
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