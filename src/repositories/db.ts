import { MongoClient } from "mongodb";
import { PostViewModel } from "../models/PostModel";
import { BlogViewModel } from "../models/BlogModel";
import { CONFIG } from "../utils/config";

export const client = new MongoClient(CONFIG.LOCAL_MONGO_URL);

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