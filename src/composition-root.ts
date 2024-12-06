import { Container } from "inversify";
import { BlogsRepository } from "./components/blogs/repositories/blogsRepository";
import { BlogsService } from "./components/blogs/blogsService";
import { BlogsQueryRepository } from "./components/blogs/repositories/blogsQueryRepository";
import { PostsRepository } from "./components/posts/repositories/postsRepository";
import { PostsService } from "./components/posts/postsService";
import { PostsQueryRepository } from "./components/posts/repositories/postsQueryRepository";
import { UsersRepository } from "./components/users/repositories/usersRepository";
import { UsersService } from "./components/users/usersService";
import { UsersQueryRepository } from "./components/users/repositories/usersQueryRepository";
import { CommentsRepository } from "./components/comments/repositories/commentsRepository";
import { CommentsService } from "./components/comments/services/commentsService";
import { CommentsQueryRepository } from "./components/comments/repositories/commentsQueryRepository";
import { CommentsQueryService } from "./components/comments/services/commentsQueryService";
import { ApiLogsRepository } from "./components/security/apiLogs/apiLogsRepository";
import { ApiLogsService } from "./components/security/apiLogs/apiLogsService";
import { DeviceQueryRepository } from "./components/security/devices/deviceQueryRepository";
import { SessionsService } from "./components/security/sessions/sessionsService";
import { SessionsRepository } from "./components/security/sessions/sessionsRepository";
import { AuthService } from "./components/auth/authService";

export const container = new Container();

// AUTH
container.bind(AuthService).to(AuthService);

// BLOGS
container.bind(BlogsRepository).to(BlogsRepository);
container.bind(BlogsService).to(BlogsService);
container.bind(BlogsQueryRepository).to(BlogsQueryRepository);

// POSTS
container.bind(PostsRepository).to(PostsRepository);
container.bind(PostsService).to(PostsService);
container.bind(PostsQueryRepository).to(PostsQueryRepository);

// USERS
container.bind(UsersRepository).to(UsersRepository);
container.bind(UsersService).to(UsersService);
container.bind(UsersQueryRepository).to(UsersQueryRepository);

// COMMENTS
container.bind(CommentsRepository).to(CommentsRepository);
container.bind(CommentsService).to(CommentsService);
container.bind(CommentsQueryRepository).to(CommentsQueryRepository);
container.bind(CommentsQueryService).to(CommentsQueryService);

// DEVICES (SESSIONS), API LOGS
container.bind(ApiLogsRepository).to(ApiLogsRepository);
container.bind(ApiLogsService).to(ApiLogsService);
container.bind(DeviceQueryRepository).to(DeviceQueryRepository);
container.bind(SessionsService).to(SessionsService);
container.bind(SessionsRepository).to(SessionsRepository);
