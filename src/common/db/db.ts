import { Collection, Db, MongoClient } from "mongodb";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { CONFIG } from "../utils/config";
import { SessionDbModel } from "../../components/security/sessions/models/SessionDbModel";
import { ApiLogDbModel } from "../../components/security/apiLogs/models/ApiLogDbModel";

let db: Db;
export let client: MongoClient;
export let server: MongoMemoryServer;

export let apiLogsCollection: Collection<ApiLogDbModel>;

export const runDB = async () => {
  if (CONFIG.IS_API_TEST === "true") {
    server = await MongoMemoryServer.create();
    const uri = server.getUri();
    client = new MongoClient(uri);

    db = client.db("better-life-blog");

    apiLogsCollection = db.collection<ApiLogDbModel>("api-logs");

    console.log("Using MongoDB in memory");
    return;
  }

  try {
    client = new MongoClient(CONFIG.LOCAL_MONGO_URL);
    await client.connect();
    db = client.db("better-life-blog");

    apiLogsCollection = db.collection<ApiLogDbModel>("api-logs");
    console.log("Connected to MongoDB successfully");

    await mongoose.connect(CONFIG.LOCAL_MONGO_URL, { dbName: "better-life-blog" });
    console.log("Connected via mongoose successfully");
  } catch (error) {
    console.error("MongoDB connection error: ", error);
    await client.close();
  }
};
