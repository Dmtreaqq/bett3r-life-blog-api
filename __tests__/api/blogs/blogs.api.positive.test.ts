import { CONFIG } from "../../../src/common/utils/config";
import { HTTP_STATUSES } from "../../../src/common/utils/types";
import { BlogApiResponseModel } from "../../../src/components/blogs/models/BlogApiResponseModel";
import { BlogApiRequestModel } from "../../../src/components/blogs/models/BlogApiRequestModel";
import { fromUTF8ToBase64 } from "../../../src/common/middlewares/basicAuthMiddleware";
import { runDB } from "../../../src/common/db/db";
import { request } from '../test-helper'
import { BlogDbModel } from "../../../src/components/blogs/models/BlogDbModel";
import { PostDbModel } from "../../../src/components/posts/models/PostDbModel";
import {blogsTestManager} from "./blogsTestManager";
import {postsTestManager} from "../posts/postsTestManager";
import {postApiRequestModel, postApiResponseModel} from "../constants";
import mongoose from "mongoose";
import { PostApiResponseModel } from "../../../src/components/posts/models/PostApiResponseModel";


const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const blogInput: BlogDbModel = {
    name: 'Somebody Who',
    description: 'Some description' + Math.floor(Math.random() * 5 + 1),
    websiteUrl: 'https://somewebsite.com',
    createdAt: new Date().toISOString() + 1,
    isMembership: false
}

const postInput: PostDbModel = {
    createdAt: new Date().toISOString(),
    blogId: '123',
    blogName: blogInput.name,
    title: 'post',
    content: 'Abcdefg',
    shortDescription: 'dsadadas'
} as PostDbModel;

const blogEntity: BlogApiResponseModel = {
    id: '1',
    name: blogInput.name,
    description: blogInput.description,
    websiteUrl: blogInput.websiteUrl,
    createdAt: "2024-09-25T13:47:55.913Z",
    isMembership: false
}

const postEntity: PostApiResponseModel = {
    id: '???',
    title: postInput.title,
    content: postInput.content,
    shortDescription: postInput.shortDescription,
    blogId: '???',
    blogName: blogEntity.name,
    createdAt: "2024-09-25T13:47:55.913Z",
    extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: []
    }
}

describe('/blogs positive', () => {
    beforeAll(async () => {
        await runDB()
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
    })

    afterAll(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        await mongoose.disconnect()

        // if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    afterEach(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
    })

    it('should POST a blog successfully', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .send(blogInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.CREATED_201);

        expect(response.body).toEqual({
            ...blogEntity,
            id: expect.any(String),
            createdAt: expect.any(String)
        })
    })

    it('should GET created blog successfully', async () => {
        const blog = await blogsTestManager.createBlog()

        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${blog.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual(blog);
    })

    it('should GET empty array blogs successfully', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual({
            items: expect.arrayContaining([]),
            totalCount: 0,
            pagesCount: 1,
            pageSize: 10,
            page: 1
        });
    })

    it('should GET posts for a certain blog successfully', async () => {
        const blog = await blogsTestManager.createBlog()
        const post = await postsTestManager.createPost(blog.id)

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${blog.id}/posts`)
            .expect(HTTP_STATUSES.OK_200)

        expect(getResponse.body).toEqual({
            "items": [post],
            "page": 1,
            "pageSize": 10,
            "pagesCount": 1,
            "totalCount": 1
        })
    })

    it('should GET blogs by searchNameTerm successfully', async () => {
        const blog = await blogsTestManager.createBlog({
            name: 'bOdY',
            websiteUrl: 'https://test-domain.com',
            description: 'This is a description for a blog name current'
        })

        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?searchNameTerm=BODY`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response1.body.items).toEqual(expect.arrayContaining([blog]))

        const response2 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?searchNameTerm=body`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response2.body.items).toEqual(expect.arrayContaining([blog]))
    })

    it('should PUT blog successfully', async () => {
        const blog = await blogsTestManager.createBlog()
        const newBody: BlogApiRequestModel = {
            name: 'newBlogName',
            description: blog.description,
            websiteUrl: blog.websiteUrl
        }

        await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${blog.id}`)
            .send(newBody)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${blog.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual({ ...blog, name: newBody.name });
    })

    it('should GET blogs using sorting successfully', async () => {
        const blogs = await blogsTestManager.createBlogs(5)

        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?sortBy=name&sortDirection=asc&searchNameTerm=tor`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response1.body.items[0].name).toEqual(blogs[0].name)

        const response2 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?sortBy=name&sortDirection=desc&searchNameTerm=tor`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response2.body.items[0].name).toEqual(blogs[blogs.length - 1].name)
    })

    it('should GET blogs using pagination successfully', async () => {
        const blogs = await blogsTestManager.createBlogs(5)

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?pageSize=2&pageNumber=2&searchNameTerm=${blogs[0].name.slice(0, 3)}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual({
            items: expect.any(Array),
            totalCount: 5,
            pagesCount: 3,
            pageSize: 2,
            page: 2
        });
        expect(getResponse.body.items).toHaveLength(2)
    })

    it('should POST post for a certain blog', async () => {
        const blog = await blogsTestManager.createBlog()

        const response = await request
            .post(`${baseUrl}${CONFIG.PATH.BLOGS}/${blog.id}/posts`)
            .send(postApiRequestModel)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.CREATED_201);

        expect(response.body).toEqual({
            ...postApiResponseModel,
            id: expect.any(String),
            createdAt: expect.any(String),
            blogId: blog.id,
            blogName: blog.name,
        })

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${response.body.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual({
            ...postApiResponseModel,
            id: expect.any(String),
            createdAt: expect.any(String),
            blogId: blog.id,
            blogName: blog.name,
        })
    })

    it('should GET posts for a certain blog', async () => {
        const blog = await blogsTestManager.createBlog()

        await request
            .post(`${baseUrl}${CONFIG.PATH.BLOGS}/${blog.id}/posts`)
            .send(postInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.CREATED_201);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${blog.id}/posts`)
            .expect(HTTP_STATUSES.OK_200)

        expect(getResponse.body.items[0]).toEqual({
            ...postEntity,
            blogName: 'BlogName',
            id: expect.any(String),
            createdAt: expect.any(String),
            blogId: blog.id
        })
    })

    it('should DELETE blog successfully', async () => {
        const blog = await blogsTestManager.createBlog()

        await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/${blog.id}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${blog.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })
})
