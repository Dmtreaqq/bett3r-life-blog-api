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
        const blogsRepository = new BlogsRepository()
        const blogsQueryRepository = new BlogsQueryRepository()
        const postsRepository = new PostsRepository()
        const postsQueryRepository = new PostsQueryRepository()

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
            .set('Cookie', [refreshToken])
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

        // await request
        //   .put(baseUrl + CONFIG.PATH.COMMENTS + `/${comment.id}/like-status`)
        //   .set('authorization', `Bearer ${token}`)
        //   .send({
        //       likeStatus: "Dislike"
        //   })
        //   .expect(HTTP_STATUSES.NO_CONTENT_204);

        // const getResponse2 = await request
        //   .get(baseUrl + CONFIG.PATH.COMMENTS + `/${comment.id}`)
        //   .set('Cookie', [refreshToken])
        //   .set('authorization', `Bearer ${token}`)
        //   .expect(HTTP_STATUSES.OK_200);

        // expect(getResponse2.body).toEqual({
        //     ...comment,
        //     id: expect.any(String),
        //     createdAt: expect.any(String),
        //     likesInfo: {
        //         likesCount: 0,
        //         dislikesCount: 1,
        //         myStatus: "Dislike"
        //     }
        // })
    })
})
