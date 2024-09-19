"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRepository = void 0;
const db_1 = require("../db");
const crypto_1 = require("crypto");
const blogsRepository_1 = require("./blogsRepository");
exports.postsRepository = {
    getPosts() {
        return db_1.postsDB;
    },
    getPostById(id) {
        return db_1.postsDB.find(post => post.id === id);
    },
    createPost(postInput) {
        const blogName = blogsRepository_1.blogsRepository.getBlogById(postInput.blogId).name;
        const post = {
            id: (0, crypto_1.randomUUID)(),
            title: postInput.title,
            shortDescription: postInput.shortDescription,
            content: postInput.content,
            blogId: postInput.blogId,
            blogName: blogName
        };
        db_1.postsDB.push(post);
        return post;
    },
    updatePostById(newPostInput) {
        db_1.postsDB.forEach((post, index) => {
            if (post.id === newPostInput.id) {
                db_1.postsDB[index] = newPostInput;
            }
        });
    },
    deletePostById(id) {
        const foundPostIndex = db_1.postsDB.findIndex(post => post.id === id);
        db_1.postsDB.splice(foundPostIndex, 1);
    }
};
