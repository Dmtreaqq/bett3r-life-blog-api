import { Router, Request, Response } from "express";
import { blogsRepository } from "../blogs/repositories/blogsRepository";
import { postsRepository } from "../posts/repositories/postsRepository";
import {usersRepository} from "../users/repositories/usersRepository";

export const testingController = Router();

testingController.delete("/all-data", async (req: Request, res: Response) => {
    await blogsRepository.deleteAllBlogs();
    await postsRepository.deleteAllPosts();
    await usersRepository.deleteAllUsers();

    return res.sendStatus(204);
})
