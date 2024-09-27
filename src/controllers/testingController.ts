import { Router, Request, Response } from "express";
import { blogsRepository } from "../repositories/blogsRepository";
import { postsRepository } from "../repositories/postsRepository";

export const testingController = Router();

testingController.delete("/all-data", async (req: Request, res: Response) => {
    await blogsRepository.deleteAllBlogs();
    await postsRepository.deleteAllPosts();

    return res.sendStatus(204);
})
