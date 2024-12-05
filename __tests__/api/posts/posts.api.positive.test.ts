import { CONFIG } from "../../../src/common/utils/config";
import { HTTP_STATUSES } from "../../../src/common/utils/types";
import { BlogsRepository } from "../../../src/components/blogs/repositories/blogsRepository";
import { fromUTF8ToBase64 } from "../../../src/common/middlewares/basicAuthMiddleware";
import { PostsRepository } from "../../../src/components/posts/repositories/postsRepository";
import { runDB } from "../../../src/common/db/db";
import { request } from '../test-helper';
import { PostDbModel } from "../../../src/components/posts/models/PostDbModel";
import { BlogDbModel } from "../../../src/components/blogs/models/BlogDbModel";
import {BlogsQueryRepository} from "../../../src/components/blogs/repositories/blogsQueryRepository";
import {PostsQueryRepository} from "../../../src/components/posts/repositories/postsQueryRepository";
import mongoose from "mongoose";
import { PostApiResponseModel } from "../../../src/components/posts/models/PostApiResponseModel";
import { PostApiRequestModel } from "../../../src/components/posts/models/PostApiRequestModel";
import { blogsTestManager } from "../blogs/blogsTestManager";
import { postsTestManager } from "./postsTestManager";
import { usersTestManager } from "../users/usersTestManager";
import { authTestManager } from "../auth/authTestManager";
import { postApiRequestModel } from "../constants";
import { container } from "../../../src/composition-root";

const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const blogInput: BlogDbModel = {
    name: 'Doctor Who Blog',
    description: 'Blog about Doctor Who',
    websiteUrl: 'https://doctor.who.com',
    createdAt: new Date().toISOString(),
    isMembership: false
};

const postInput: PostDbModel = {
    blogName: blogInput.name,
    createdAt: new Date().toISOString(),
    title: 'z 9',
    content: 'Abcdefg',
    shortDescription: 'dsadadas',
    blogId: '123'
} as PostDbModel;

const postEntity: PostApiResponseModel = {
    id: '???',
    title: postInput.title,
    content: postInput.content,
    shortDescription: postInput.shortDescription,
    blogId: '???',
    blogName: '???',
    createdAt: "2024-09-25T13:47:55.913Z",
    extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: []
    }
}

describe('/posts positive', () => {
    let createdPostId: string;
    let createdBlog: BlogDbModel | null;
    let createdBlogId: string;
    let createdPostResponse: PostApiResponseModel | null;

    beforeAll(async () => {
        await runDB()
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        const blogsRepository = container.resolve(BlogsRepository)
        const blogsQueryRepository = container.resolve(BlogsQueryRepository)
        const postsRepository = container.resolve(PostsRepository)
        const postsQueryRepository = container.resolve(PostsQueryRepository)

        createdBlogId = await blogsRepository.createBlog(blogInput);
        createdBlog = await blogsQueryRepository.getBlogById(createdBlogId)
        createdPostId = await postsRepository.createPost({ ...postInput, blogId: createdBlogId })
        createdPostResponse = await postsQueryRepository.getPostById(createdPostId)

        await postsRepository.createPost({ ...postInput, blogId: createdBlogId, title: 'a 1' })
        await postsRepository.createPost({ ...postInput, blogId: createdBlogId, title: 'b 2' })
        await postsRepository.createPost({ ...postInput, blogId: createdBlogId, title: 'c 3' })
        await postsRepository.createPost({ ...postInput, blogId: createdBlogId, title: 'd 4' })
        await postsRepository.createPost({ ...postInput, blogId: createdBlogId, title: 'e 5' })
    })

    afterAll(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        await mongoose.disconnect()
        // if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    it('should POST a post successfully', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send({ ...postInput, blogId: createdBlogId })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.CREATED_201);

        expect(response.body).toEqual({
            ...postEntity,
            blogName: createdBlog!.name,
            blogId: createdBlogId,
            id: expect.any(String),
            createdAt: expect.any(String),
        })
    })

    it('should GET created post successfully', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPostId}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual(createdPostResponse)
    })

    it('should GET post array including created post', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual({
            items: expect.arrayContaining([createdPostResponse]),
            page: 1,
            pageSize: 10,
            pagesCount: 1,
            totalCount: 7
        })
    })

    it('should PUT post successfully', async () => {
        const editedPostInput: PostApiRequestModel = {
            blogId: createdBlogId,
            title: 'Doctor House',
            content: 'Video',
            shortDescription: 'TV series about a doctor House'
        }

        await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPostId}`)
            .send(editedPostInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPostId}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual({ ...createdPostResponse, ...editedPostInput });
    })

    it('should DELETE post successfully', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPostId}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPostId}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('should GET posts using sorting', async () => {
        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/?sortBy=title&sortDirection=desc`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response1.body.items[0].title).toEqual('z 9')

        const response2 = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/?sortBy=title&sortDirection=asc`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response2.body.items[0].title).toEqual('a 1')
    })

    it('should GET posts using pagination', async () => {
        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/?pageSize=2`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response1.body.items).toHaveLength(2)

        const response2 = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/?pageNumber=8&pageSize=2`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response2.body.items).toHaveLength(0)
    })

    it('should PUT LIKE and DISLIKE post successfully', async () => {
        const blog = await blogsTestManager.createBlog()
        const post = await postsTestManager.createPost(blog.id);
        const user = await usersTestManager.createUser()
        const { accessToken: token, refreshToken } = await authTestManager.loginByEmail(user.email, 'password')
    

        await request
            .put(baseUrl + CONFIG.PATH.POSTS + `/${post.id}/like-status`)
            .set('authorization', `Bearer ${token}`)
            .send({
                likeStatus: "Like"
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const getResponse1 = await request
            .get(baseUrl + CONFIG.PATH.POSTS + `/${post.id}`)
            .set('authorization', `Bearer ${token}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse1.body).toEqual({
            ...post,
            id: expect.any(String),
            createdAt: expect.any(String),
            extendedLikesInfo: {
                likesCount: 1,
                dislikesCount: 0,
                myStatus: "Like",
                newestLikes: [{
                    addedAt: expect.any(String),
                    login: user.login,
                    userId: user.id
                }]
            }
        })
    })

    it('should PUT LIKES', async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        const blog = await blogsTestManager.createBlog()

        const post1 = await postsTestManager.createPost(blog.id);
        const post2 = await postsTestManager.createPost(blog.id, { ...postApiRequestModel, title: "Post 2" });
        const post3 = await postsTestManager.createPost(blog.id, { ...postApiRequestModel, title: "Post 3" });
        const post4 = await postsTestManager.createPost(blog.id, { ...postApiRequestModel, title: "Post 4" });
        const post5 = await postsTestManager.createPost(blog.id, { ...postApiRequestModel, title: "Post 5" });
        const post6 = await postsTestManager.createPost(blog.id, { ...postApiRequestModel, title: "Post 6" });

        const user1 = await usersTestManager.createUser()
        const user2 = await usersTestManager.createUser({ email: "user2@gmail.com", login: "userlogin2", password: 'password' })
        const user3 = await usersTestManager.createUser({ email: "user3@gmail.com", login: "userlogin3", password: 'password' })
        const user4 = await usersTestManager.createUser({ email: "user4@gmail.com", login: "userlogin4", password: 'password' })
        const { accessToken: token1 } = await authTestManager.loginByEmail(user1.email, 'password')
        const { accessToken: token2 } = await authTestManager.loginByEmail(user2.email, 'password')
        const { accessToken: token3 } = await authTestManager.loginByEmail(user3.email, 'password')
        const { accessToken: token4 } = await authTestManager.loginByEmail(user4.email, 'password')
    

        // like post 1 by user 1, user 2; 
        await request
            .put(baseUrl + CONFIG.PATH.POSTS + `/${post1.id}/like-status`)
            .set('authorization', `Bearer ${token1}`)
            .send({
                likeStatus: "Like"
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .put(baseUrl + CONFIG.PATH.POSTS + `/${post1.id}/like-status`)
            .set('authorization', `Bearer ${token2}`)
            .send({
                likeStatus: "Like"
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        // like post 2 by user 2, user 3;
        await request
            .put(baseUrl + CONFIG.PATH.POSTS + `/${post2.id}/like-status`)
            .set('authorization', `Bearer ${token2}`)
            .send({
                likeStatus: "Like"
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
          .put(baseUrl + CONFIG.PATH.POSTS + `/${post2.id}/like-status`)
          .set('authorization', `Bearer ${token3}`)
          .send({
              likeStatus: "Like"
          })
          .expect(HTTP_STATUSES.NO_CONTENT_204);

        // dislike post3 by user1
        await request
          .put(baseUrl + CONFIG.PATH.POSTS + `/${post3.id}/like-status`)
          .set('authorization', `Bearer ${token1}`)
          .send({
              likeStatus: "Dislike"
          })
          .expect(HTTP_STATUSES.NO_CONTENT_204);

        // likes post4 by user1, user4, user2, user3

        await request
          .put(baseUrl + CONFIG.PATH.POSTS + `/${post4.id}/like-status`)
          .set('authorization', `Bearer ${token1}`)
          .send({
              likeStatus: "Like"
          })
          .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
          .put(baseUrl + CONFIG.PATH.POSTS + `/${post4.id}/like-status`)
          .set('authorization', `Bearer ${token4}`)
          .send({
              likeStatus: "Like"
          })
          .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
          .put(baseUrl + CONFIG.PATH.POSTS + `/${post4.id}/like-status`)
          .set('authorization', `Bearer ${token2}`)
          .send({
              likeStatus: "Like"
          })
          .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
          .put(baseUrl + CONFIG.PATH.POSTS + `/${post4.id}/like-status`)
          .set('authorization', `Bearer ${token3}`)
          .send({
              likeStatus: "Like"
          })
          .expect(HTTP_STATUSES.NO_CONTENT_204);

        // like post 5 by user 2, dislike by user 3;

        await request
          .put(baseUrl + CONFIG.PATH.POSTS + `/${post5.id}/like-status`)
          .set('authorization', `Bearer ${token2}`)
          .send({
              likeStatus: "Like"
          })
          .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
          .put(baseUrl + CONFIG.PATH.POSTS + `/${post5.id}/like-status`)
          .set('authorization', `Bearer ${token3}`)
          .send({
              likeStatus: "Dislike"
          })
          .expect(HTTP_STATUSES.NO_CONTENT_204);

        // like post 6 by user 1, dislike by user 2.

        await request
          .put(baseUrl + CONFIG.PATH.POSTS + `/${post6.id}/like-status`)
          .set('authorization', `Bearer ${token1}`)
          .send({
              likeStatus: "Like"
          })
          .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
          .put(baseUrl + CONFIG.PATH.POSTS + `/${post6.id}/like-status`)
          .set('authorization', `Bearer ${token2}`)
          .send({
              likeStatus: "Dislike"
          })
          .expect(HTTP_STATUSES.NO_CONTENT_204);

        // Get the all posts by user1
        const getResponse1 = await request
            .get(baseUrl + CONFIG.PATH.POSTS)
            .set('authorization', `Bearer ${token1}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse1.body).toEqual({
            items: [
                {
                    ...post6,
                    id: expect.any(String),
                    createdAt: expect.any(String),
                    extendedLikesInfo: {
                        likesCount: 1,
                        dislikesCount: 1,
                        myStatus: "Like",
                        newestLikes: [
                            {
                                addedAt: expect.any(String),
                                login: user1.login,
                                userId: user1.id
                            }
                        ]
                    }
                },
                {
                    ...post5,
                    id: expect.any(String),
                    createdAt: expect.any(String),
                    extendedLikesInfo: {
                        likesCount: 1,
                        dislikesCount: 1,
                        myStatus: "None",
                        newestLikes: [
                            {
                                addedAt: expect.any(String),
                                login: user2.login,
                                userId: user2.id
                            }
                        ]
                    }
                },
                {
                    ...post4,
                    id: expect.any(String),
                    createdAt: expect.any(String),
                    extendedLikesInfo: {
                        likesCount: 4,
                        dislikesCount: 0,
                        myStatus: "Like",
                        newestLikes: [
                            {
                                addedAt: expect.any(String),
                                login: user3.login,
                                userId: user3.id
                            },
                            {
                                addedAt: expect.any(String),
                                login: user2.login,
                                userId: user2.id
                            },
                            {
                                addedAt: expect.any(String),
                                login: user4.login,
                                userId: user4.id
                            }
                        ]
                    }
                },
                {
                    ...post3,
                    id: expect.any(String),
                    createdAt: expect.any(String),
                    extendedLikesInfo: {
                        likesCount: 0,
                        dislikesCount: 1,
                        myStatus: "Dislike",
                        newestLikes: []
                    }
                },
                {
                    ...post2,
                    id: expect.any(String),
                    createdAt: expect.any(String),
                    extendedLikesInfo: {
                        likesCount: 2,
                        dislikesCount: 0,
                        myStatus: "None",
                        newestLikes: [
                            {
                                addedAt: expect.any(String),
                                login: user3.login,
                                userId: user3.id
                            },
                            {
                                addedAt: expect.any(String),
                                login: user2.login,
                                userId: user2.id
                            }
                        ]
                    }
                },
              {
                ...post1,
                id: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 2,
                    dislikesCount: 0,
                    myStatus: "Like",
                    newestLikes: [
                      {
                          addedAt: expect.any(String),
                          login: user2.login,
                          userId: user2.id
                      },
                      {
                        addedAt: expect.any(String),
                        login: user1.login,
                        userId: user1.id
                      }
                    ]
                }
            },
            ],
            page: expect.any(Number),
            pageSize: expect.any(Number),
            pagesCount: expect.any(Number),
            totalCount: expect.any(Number)
        })
    })
})
