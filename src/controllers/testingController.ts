import { Router, Request, Response } from "express";
import { postsDB, blogsDB } from "../db";

export const testingController = Router();

testingController.delete("/all-data", async (req: Request, res: Response) => {
    blogsDB.splice(0);
    postsDB.splice(0);

    return res.sendStatus(204);
})
