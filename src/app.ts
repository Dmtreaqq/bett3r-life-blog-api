import express, { Request, Response, NextFunction } from "express";
import { CONFIG } from "./common/utils/config";
import { testingController } from "./components/tests/testingController";
import { postsRouter } from "./components/posts/postsController";
import { blogsRouter } from "./components/blogs/blogsController";
import {usersRouter} from "./components/users/usersController";
import {errorHandlerMiddleware} from "./common/middlewares/errorHandlerMiddleware";
import {authRouter} from "./components/auth/authController";
import {commentsRouter} from "./components/comments/commentsController";
import cookieParser from "cookie-parser";
import {securityDevicesRouter} from "./components/security/devices/devicesController";

export const app = express();

app.disable('x-powered-by');

const baseUrl = '/api';
const testingPathUrl = baseUrl + CONFIG.PATH.TESTING;
const postsPathUrl = baseUrl + CONFIG.PATH.POSTS;
const blogsPathsUrl = baseUrl + CONFIG.PATH.BLOGS;
const blogsUsersUrl = baseUrl + CONFIG.PATH.USERS;
const authPathUrl = baseUrl + CONFIG.PATH.AUTH;
const commentsPathUrl = baseUrl + CONFIG.PATH.COMMENTS
const securityPathUrl = baseUrl + CONFIG.PATH.SECURITY

app.use(express.json());
app.use(cookieParser())

app.use(testingPathUrl, testingController);
app.use(postsPathUrl, postsRouter);
app.use(blogsPathsUrl, blogsRouter);
app.use(blogsUsersUrl, usersRouter);
app.use(authPathUrl, authRouter);
app.use(commentsPathUrl, commentsRouter);
app.use(securityPathUrl, securityDevicesRouter)

app.use(errorHandlerMiddleware);
