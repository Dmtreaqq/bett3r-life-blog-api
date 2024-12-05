import mongoose from "mongoose";
// import { MongoMemoryServer } from "mongodb-memory-server";
import { CONFIG } from "../utils/config";

export const runDB = async () => {
  // if (CONFIG.IS_API_TEST === "true") {
  //   server = await MongoMemoryServer.create();
  //   const uri = server.getUri();
  //   client = new MongoClient(uri);
  //
  //   db = client.db("better-life-blog");
  //
  //   console.log("Using MongoDB in memory");
  //   return;
  // }

  try {
    await mongoose.connect(CONFIG.LOCAL_MONGO_URL, { dbName: "better-life-blog" });
    console.log("Connected via mongoose successfully");
  } catch (error) {
    console.error("MongoDB/Mongoose connection error: ", error);
    await mongoose.disconnect();
  }
};
