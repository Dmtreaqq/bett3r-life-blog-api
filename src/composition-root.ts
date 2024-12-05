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
