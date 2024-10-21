import { CONFIG } from "../../../src/common/utils/config";
import { HTTP_STATUSES } from "../../../src/common/utils/types";
import {
    BlogApiResponseModel,
    BlogsApiResponseModel
} from "../../../src/components/blogs/models/BlogApiModel";
import { blogsRepository } from "../../../src/components/blogs/repositories/blogsRepository";
import { fromUTF8ToBase64 } from "../../../src/common/middlewares/basicAuthMiddleware";
import { client, runDB } from "../../../src/common/db/db";
import { request } from '../test-helper'
import { server } from "../../../src/common/db/db";
import { BlogDbModel } from "../../../src/components/blogs/models/BlogDbModel";
import { PostApiResponseModel } from "../../../src/components/posts/models/PostApiModel";
import { postsRepository } from "../../../src/components/posts/repositories/postsRepository";
import { ObjectId } from "mongodb";
import { PostDbModel } from "../../../src/components/posts/models/PostDbModel";
import {blogsQueryRepository} from "../../../src/components/blogs/repositories/blogsQueryRepository";
import {postsQueryRepository} from "../../../src/components/posts/repositories/postsQueryRepository";


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
}

describe('/blogs positive', () => {
    let createdBlogId: string;
    let createdBlogResponse: BlogApiResponseModel | null;

    beforeAll(async () => {
        await runDB()
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        createdBlogId = await blogsRepository.createBlog({ ...blogInput, _id: new ObjectId() } as any);
        createdBlogResponse = await blogsQueryRepository.getBlogById(createdBlogId);

        await blogsRepository.createBlog({ ...blogInput, name: 'Doctor House', _id: new ObjectId() } as any);
        await blogsRepository.createBlog({ ...blogInput, name: 'Doctor Who', _id: new ObjectId() } as any );
        await blogsRepository.createBlog({ ...blogInput, name: 'Doctor Strange', _id: new ObjectId() } as any);
        await blogsRepository.createBlog({ ...blogInput, name: 'Doctor Connors', _id: new ObjectId() } as any);
        await blogsRepository.createBlog({ ...blogInput, name: 'Doctor Drake', _id: new ObjectId() } as any);
    })

    afterAll(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        await client.close();

        if (CONFIG.IS_API_TEST === 'true') await server.stop();
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
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual(createdBlogResponse);
    })

    it('should GET blogs successfully', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual({
            items: expect.arrayContaining([createdBlogResponse]),
            totalCount: 7,
            pagesCount: 1,
            pageSize: 10,
            page: 1
        } as BlogsApiResponseModel);
    })

    it('should GET posts for a certain blog successfully', async () => {
        const blogId = await blogsRepository.createBlog({...blogInput, _id: new ObjectId() } as any);
        const postId = await postsRepository.createPost({ ...postInput, blogId: blogId })
        const post = await postsQueryRepository.getPostById(postId);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${blogId}/posts`)
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
        const newBlogId = await blogsRepository.createBlog({ ...blogInput, name: 'Somebody House', _id: new ObjectId() } as any );
        const responseNewBlog = await blogsQueryRepository.getBlogById(newBlogId);

        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?searchNameTerm=BODY`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response1.body.items).toEqual(expect.arrayContaining([createdBlogResponse, responseNewBlog]))

        const response2 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?searchNameTerm=body`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response2.body.items).toEqual(expect.arrayContaining([createdBlogResponse, responseNewBlog]))
    })

    it('should PUT blog successfully', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}`)
            .send(blogInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual(createdBlogResponse);
    })

    it('should GET blogs using sorting successfully', async () => {
        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?sortBy=name&sortDirection=desc&searchNameTerm=tor`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response1.body.items[0].name).toEqual('Doctor Who')

        const response2 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?sortBy=name&sortDirection=asc&searchNameTerm=tor`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response2.body.items[0].name).toEqual('Doctor Connors')
    })

    it('should GET blogs using pagination successfully', async () => {
        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?pageSize=2&searchNameTerm=tor`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response1.body.items).toHaveLength(2)
        expect(response1.body.pageSize).toEqual(2)
        expect(response1.body.page).toEqual(1)

        const response2 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?pageSize=2&pageNumber=3&searchNameTerm=tor`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response2.body.items).toHaveLength(1)
        expect(response2.body.pageSize).toEqual(2)
        expect(response2.body.page).toEqual(3)
    })

    it('should POST post for a certain blog', async () => {
        const response = await request
            .post(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}/posts`)
            .send(postInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.CREATED_201);

        expect(response.body).toEqual({
            ...postEntity,
            id: expect.any(String),
            createdAt: expect.any(String),
            blogId: createdBlogId.toString()
        })

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${response.body.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual({
            ...postEntity,
            id: expect.any(String),
            createdAt: expect.any(String),
            blogId: createdBlogId.toString()
        })
    })

    it('should GET posts for a certain blog', async () => {
        await request
            .post(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}/posts`)
            .send(postInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.CREATED_201);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}/posts`)
            .expect(HTTP_STATUSES.OK_200)

        expect(getResponse.body.items[0]).toEqual({
            ...postEntity,
            id: expect.any(String),
            createdAt: expect.any(String),
            blogId: createdBlogId.toString()
        })
    })

    it('should DELETE blog successfully', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })
})
