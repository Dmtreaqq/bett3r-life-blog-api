import express from "express";
import { CONFIG } from "./utils/config";
import { testingController } from "./components/tests/testingController";
import { postsRouter } from "./components/posts/postsController";
import { blogsRouter } from "./components/blogs/blogsController";
import {usersRouter} from "./components/users/usersController";

export const app = express();

const baseUrl = '/api';
const testingPathUrl = baseUrl + CONFIG.PATH.TESTING;
const postsPathUrl = baseUrl + CONFIG.PATH.POSTS;
const blogsPathsUrl = baseUrl + CONFIG.PATH.BLOGS;
const blogsUsersUrl = baseUrl + CONFIG.PATH.USERS;

app.use(express.json());

app.use(testingPathUrl, testingController);
app.use(postsPathUrl, postsRouter);
app.use(blogsPathsUrl, blogsRouter);
app.use(blogsUsersUrl, usersRouter);
