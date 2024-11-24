import { Router, Request, Response } from "express";
import { BlogsRepository } from "../blogs/repositories/blogsRepository";
import { postsRepository } from "../posts/repositories/postsRepository";
import { usersRepository } from "../users/repositories/usersRepository";
import { sessionsRepository } from "../security/sessions/sessionsRepository";
import { apiLogsRepository } from "../security/apiLogs/apiLogsRepository";

export const testingRouter = Router();

class TestingController {
  private blogsRepository: BlogsRepository;
  constructor() {
    this.blogsRepository = new BlogsRepository();
  }

  async delete(req: Request, res: Response) {
    await this.blogsRepository.deleteAllBlogs();
    await postsRepository.deleteAllPosts();
    await usersRepository.deleteAllUsers();
    await sessionsRepository.deleteAllSessions();
    await apiLogsRepository.deleteAllLogs();

    return res.sendStatus(204);
  }
}

export const testingController = new TestingController();

testingRouter.delete("/all-data", testingController.delete.bind(testingController));
