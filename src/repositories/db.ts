import { PostViewModel } from "../models/PostModel";
import { BlogViewModel } from "../models/BlogModel";
import { CONFIG } from "../utils/config";

const postsDB: PostViewModel[] = [];
const blogsDB: BlogViewModel[] = [];

export {postsDB, blogsDB};


// import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from "mongodb";

export const client = new MongoClient(CONFIG.MONGO_URL);

export const runDB = async () => {
    try {
        await client.db('better-life-blog').command({ ping: 1 })
        console.log('Connected to MongoDB successfully')
    } catch (error) {
        console.error('MongoDB connection error: ', error)
        await client.close();
    }
}

export const blogsCollection = client.db('better-life-blog').collection<BlogViewModel>("blogs");
export const postsCollection = client.db('better-life-blog').collection<PostViewModel>("posts");