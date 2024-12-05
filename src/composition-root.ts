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

export const container = new Container();

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
