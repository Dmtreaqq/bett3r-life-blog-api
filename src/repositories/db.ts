import { PostViewModel } from "../models/PostModel";
import { BlogViewModel } from "../models/BlogModel";
import { CONFIG } from "../utils/config";

const postsDB: PostViewModel[] = [];
const blogsDB: BlogViewModel[] = [];

export {postsDB, blogsDB};

import { MongoClient } from "mongodb";

export const client = new MongoClient(CONFIG.MONGO_URL);

export const runDB = async () => {
    try {
        await client.connect()
        console.log('Connected to MongoDB successfully')
    } catch (error) {
        console.error('MongoDB connection error: ', error)
        await client.close();
    }
}

const db = client.db('better-life-blog')
export const blogsCollection = db.collection<BlogViewModel>("blogs");
export const postsCollection = db.collection<PostViewModel>("posts");