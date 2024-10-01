import { Collection, Db, MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { PostApiResponseModel } from "../components/posts/models/PostApiModel";
import { BlogApiResponseModel } from "../components/blogs/models/BlogApiModel";
import { CONFIG } from "../utils/config";
import { BlogDbModel } from "../components/blogs/models/BlogDbModel";
import { PostDbModel } from "../components/posts/models/PostDbModel";

export let client: MongoClient;
let db: Db;
export let server: MongoMemoryServer;

export let blogsCollection: Collection<BlogDbModel>
export let postsCollection: Collection<PostDbModel>

export const runDB = async () => {
    if (CONFIG.IS_API_TEST === 'true') {
        server = await MongoMemoryServer.create()
        const uri = server.getUri()
        client = new MongoClient(uri)

        db = client.db('better-life-blog')

        blogsCollection = db.collection<BlogDbModel>("blogs");
        postsCollection = db.collection<PostDbModel>("posts");

        console.log('Using MongoDB in memory')
    }

    try {
        client = new MongoClient(CONFIG.LOCAL_MONGO_URL)
        await client.connect()
        db = client.db('better-life-blog')
        blogsCollection = db.collection<BlogDbModel>("blogs");
        postsCollection = db.collection<PostDbModel>("posts");
        console.log('Connected to MongoDB successfully')
    } catch (error) {
        console.error('MongoDB connection error: ', error)
        await client.close();
    }
}
