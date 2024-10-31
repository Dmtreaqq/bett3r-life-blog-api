import { Collection, Db, MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { CONFIG } from "../utils/config";
import { BlogDbModel } from "../../components/blogs/models/BlogDbModel";
import { PostDbModel } from "../../components/posts/models/PostDbModel";
import {UserDbModel} from "../../components/users/models/UserDbModel";
import {CommentDbModel} from "../../components/comments/models/CommentDbModel";
import {SessionDbModel} from "../../components/security/sessions/models/SessionDbModel";
import {ApiLogDbModel} from "../../components/security/apiLogs/models/ApiLogDbModel";

let db: Db;
export let client: MongoClient;
export let server: MongoMemoryServer;

export let blogsCollection: Collection<BlogDbModel>
export let postsCollection: Collection<PostDbModel>
export let usersCollection: Collection<UserDbModel>
export let commentsCollection: Collection<CommentDbModel>
export let sessionsCollection: Collection<SessionDbModel>
export let apiLogsCollection: Collection<ApiLogDbModel>

export const runDB = async () => {
    if (CONFIG.IS_API_TEST === 'true') {
        server = await MongoMemoryServer.create()
        const uri = server.getUri()
        client = new MongoClient(uri)

        db = client.db('better-life-blog')

        blogsCollection = db.collection<BlogDbModel>("blogs");
        postsCollection = db.collection<PostDbModel>("posts");
        usersCollection = db.collection<UserDbModel>("users");
        commentsCollection = db.collection<CommentDbModel>("comments");
        sessionsCollection = db.collection<SessionDbModel>("sessions");
        apiLogsCollection = db.collection<ApiLogDbModel>("api-logs");

        console.log('Using MongoDB in memory')
        return
    }

    try {
        client = new MongoClient(CONFIG.MONGO_URL)
        await client.connect()
        db = client.db('better-life-blog')
        blogsCollection = db.collection<BlogDbModel>("blogs");
        postsCollection = db.collection<PostDbModel>("posts");
        usersCollection = db.collection<UserDbModel>("users");
        commentsCollection = db.collection<CommentDbModel>("comments");
        sessionsCollection = db.collection<SessionDbModel>("sessions");
        apiLogsCollection = db.collection<ApiLogDbModel>("api-logs");

        console.log('Connected to MongoDB successfully')
    } catch (error) {
        console.error('MongoDB connection error: ', error)
        await client.close();
    }
}
