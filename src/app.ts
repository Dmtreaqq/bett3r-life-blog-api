import express from "express";
import { CONFIG } from "./config/config";
import { testingController } from "./controllers/testingController";
import { postsController } from "./controllers/postsController";

export const app = express();

const baseUrl = '/api';
const testingPathUrl = baseUrl + CONFIG.PATH.TESTING;
const postsPathUrl = baseUrl + CONFIG.PATH.POSTS;

app.use(express.json());

app.use(testingPathUrl, testingController);
app.use(postsPathUrl, postsController);