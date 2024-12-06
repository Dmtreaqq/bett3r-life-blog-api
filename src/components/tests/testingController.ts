import { Router, Request, Response } from "express";
import { BlogsRepository } from "../blogs/repositories/blogsRepository";
import { PostsRepository } from "../posts/repositories/postsRepository";
import { UsersRepository } from "../users/repositories/usersRepository";
import { SessionsRepository } from "../security/sessions/sessionsRepository";
import { ApiLogsRepository } from "../security/apiLogs/apiLogsRepository";
import { injectable } from "inversify";
import { container } from "../../composition-root";

export const testingRouter = Router();

@injectable()
class TestingController {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private sessionsRepository: SessionsRepository,
    private apiLogsRepository: ApiLogsRepository,
  ) {}

  async delete(req: Request, res: Response) {
    await this.blogsRepository.deleteAllBlogs();
    await this.postsRepository.deleteAllPosts();
    await this.usersRepository.deleteAllUsers();
    await this.sessionsRepository.deleteAllSessions();
    await this.apiLogsRepository.deleteAllLogs();

    return res.sendStatus(204);
  }
}

export const testingController = container.resolve(TestingController);

testingRouter.delete("/all-data", testingController.delete.bind(testingController));
