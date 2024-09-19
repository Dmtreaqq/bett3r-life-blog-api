import express from "express";
import { CONFIG } from "./utils/config";
import { testingController } from "./controllers/testingController";
import { postsController } from "./controllers/postsController";
import { blogsController } from "./controllers/blogsController";

export const app = express();

const baseUrl = '/api';
const testingPathUrl = baseUrl + CONFIG.PATH.TESTING;
const postsPathUrl = baseUrl + CONFIG.PATH.POSTS;
const blogsPathsUrl = baseUrl + CONFIG.PATH.BLOGS;

app.use(express.json());

app.use(testingPathUrl, testingController);
app.use(postsPathUrl, postsController);
app.use(blogsPathsUrl, blogsController);