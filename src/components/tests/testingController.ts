import { Router, Request, Response } from "express";
import { blogsRepository } from "../blogs/repositories/blogsRepository";
import { postsRepository } from "../posts/repositories/postsRepository";
import { usersRepository } from "../users/repositories/usersRepository";
import { sessionsRepository } from "../security/sessions/sessionsRepository";
import { apiLogsRepository } from "../security/apiLogs/apiLogsRepository";

export const testingController = Router();

testingController.delete("/all-data", async (req: Request, res: Response) => {
  await blogsRepository.deleteAllBlogs();
  await postsRepository.deleteAllPosts();
  await usersRepository.deleteAllUsers();
  await sessionsRepository.deleteAllSessions();
  await apiLogsRepository.deleteAllLogs();

  return res.sendStatus(204);
});
