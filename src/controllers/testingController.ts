import { Router, Request, Response } from "express";
import { postsDB, blogsDB } from "../repositories/db";
import { blogsRepository } from "../repositories/blogsInMemoryMongoRepository";
import { postsRepository } from "../repositories/postsInMemoryMongoRepository";

export const testingController = Router();

testingController.delete("/all-data", async (req: Request, res: Response) => {
    blogsDB.splice(0);
    postsDB.splice(0);

    await blogsRepository.deleteAllBlogs();
    await postsRepository.deleteAllPosts();

    return res.sendStatus(204);
})
