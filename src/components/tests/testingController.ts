import { Router, Request, Response } from "express";
import { BlogsRepository } from "../blogs/repositories/blogsRepository";
import { PostsRepository } from "../posts/repositories/postsRepository";
import { UsersRepository } from "../users/repositories/usersRepository";
import { SessionsRepository } from "../security/sessions/sessionsRepository";
import { ApiLogsRepository } from "../security/apiLogs/apiLogsRepository";

export const testingRouter = Router();

class TestingController {
  private blogsRepository: BlogsRepository;
  private postsRepository: PostsRepository;
  private usersRepository: UsersRepository;
  private sessionsRepository: SessionsRepository;
  private apiLogsRepository: ApiLogsRepository;

  constructor() {
    this.blogsRepository = new BlogsRepository();
    this.postsRepository = new PostsRepository();
    this.usersRepository = new UsersRepository();
    this.sessionsRepository = new SessionsRepository();
    this.apiLogsRepository = new ApiLogsRepository();
  }

  async delete(req: Request, res: Response) {
    await this.blogsRepository.deleteAllBlogs();
    await this.postsRepository.deleteAllPosts();
    await this.usersRepository.deleteAllUsers();
    await this.sessionsRepository.deleteAllSessions();
    await this.apiLogsRepository.deleteAllLogs();

    return res.sendStatus(204);
  }
}

export const testingController = new TestingController();

testingRouter.delete("/all-data", testingController.delete.bind(testingController));
