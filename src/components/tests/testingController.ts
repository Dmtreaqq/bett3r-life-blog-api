import { Router, Request, Response } from "express";
import { BlogsRepository } from "../blogs/repositories/blogsRepository";
import { PostsRepository } from "../posts/repositories/postsRepository";
import { UsersRepository } from "../users/repositories/usersRepository";
import { sessionsRepository } from "../security/sessions/sessionsRepository";
import { apiLogsRepository } from "../security/apiLogs/apiLogsRepository";

export const testingRouter = Router();

class TestingController {
  private blogsRepository: BlogsRepository;
  private postsRepository: PostsRepository;
  private usersRepository: UsersRepository;

  constructor() {
    this.blogsRepository = new BlogsRepository();
    this.postsRepository = new PostsRepository();
    this.usersRepository = new UsersRepository();
  }

  async delete(req: Request, res: Response) {
    await this.blogsRepository.deleteAllBlogs();
    await this.postsRepository.deleteAllPosts();
    await this.usersRepository.deleteAllUsers();
    await sessionsRepository.deleteAllSessions();
    await apiLogsRepository.deleteAllLogs();

    return res.sendStatus(204);
  }
}

export const testingController = new TestingController();

testingRouter.delete("/all-data", testingController.delete.bind(testingController));
