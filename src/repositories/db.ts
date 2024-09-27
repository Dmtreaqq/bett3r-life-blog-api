import { Collection, Db, MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { PostViewModel } from "../models/PostModel";
import { BlogViewModel } from "../models/BlogModel";
import { CONFIG } from "../utils/config";

export let client: MongoClient;
let db: Db;
export let server: MongoMemoryServer;

export let blogsCollection: Collection<BlogViewModel>
export let postsCollection: Collection<PostViewModel>

export const runDB = async () => {
    if (CONFIG.IS_API_TEST) {
        server = await MongoMemoryServer.create()
        const uri = server.getUri()
        client = new MongoClient(uri)
        db = client.db('better-life-blog')
        blogsCollection = db.collection<BlogViewModel>("blogs");
        postsCollection = db.collection<PostViewModel>("posts");
        console.log('Using MongoDB in memory')
        return true;
    }

    try {
        client = new MongoClient(CONFIG.LOCAL_MONGO_URL)
        await client.connect()
        db = client.db('better-life-blog')
        blogsCollection = db.collection<BlogViewModel>("blogs");
        postsCollection = db.collection<PostViewModel>("posts");
        console.log('Connected to MongoDB successfully')
        return true
    } catch (error) {
        console.error('MongoDB connection error: ', error)
        await client.close();
        return false
    }
}
