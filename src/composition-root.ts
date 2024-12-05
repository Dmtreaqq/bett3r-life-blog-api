import { Container } from "inversify";
import { BlogsRepository } from "./components/blogs/repositories/blogsRepository";
import { BlogsService } from "./components/blogs/blogsService";
import { BlogsQueryRepository } from "./components/blogs/repositories/blogsQueryRepository";
import { PostsRepository } from "./components/posts/repositories/postsRepository";
import { PostsService } from "./components/posts/postsService";
import { PostsQueryRepository } from "./components/posts/repositories/postsQueryRepository";

export const container = new Container();

// BLOGS
container.bind(BlogsRepository).to(BlogsRepository);
container.bind(BlogsService).to(BlogsService);
container.bind(BlogsQueryRepository).to(BlogsQueryRepository);

// POSTS
container.bind(PostsRepository).to(PostsRepository);
container.bind(PostsService).to(PostsService);
container.bind(PostsQueryRepository).to(PostsQueryRepository);
