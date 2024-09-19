"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogsRepository = void 0;
const crypto_1 = require("crypto");
const db_1 = require("../db");
exports.blogsRepository = {
    getBlogs() {
        return db_1.blogsDB;
    },
    getBlogById(id) {
        return db_1.blogsDB.find(blog => blog.id === id);
    },
    createBlog(blogInput) {
        const post = {
            id: (0, crypto_1.randomUUID)(),
            name: blogInput.name,
            description: blogInput.description,
            websiteUrl: blogInput.websiteUrl
        };
        db_1.blogsDB.push(post);
        return post;
    },
    updateBlogById(newBlogInput) {
        db_1.blogsDB.forEach((blog, index) => {
            if (blog.id === newBlogInput.id) {
                db_1.blogsDB[index] = newBlogInput;
            }
        });
    },
    deleteBlogById(id) {
        const foundPostIndex = db_1.blogsDB.findIndex(blog => blog.id === id);
        db_1.blogsDB.splice(foundPostIndex, 1);
    }
};
