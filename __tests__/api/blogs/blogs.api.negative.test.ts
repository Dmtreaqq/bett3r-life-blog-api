import { CONFIG } from "../../../src/common/utils/config";
import { HTTP_STATUSES } from "../../../src/common/utils/types";
import { BlogCreatePostApiRequestModel } from "../../../src/components/blogs/models/BlogApiModel";
import { fromUTF8ToBase64 } from "../../../src/common/middlewares/basicAuthMiddleware";
import { blogsRepository } from "../../../src/components/blogs/repositories/blogsRepository";
import { client, runDB, server } from "../../../src/common/db/db";
import { request } from "../test-helper";
import { BlogDbModel } from "../../../src/components/blogs/models/BlogDbModel";
import { ObjectId } from "mongodb";

const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const blogInput: BlogDbModel = {
    name: 'SomeBlog',
    description: 'Some description',
    websiteUrl: 'https://somewebsite.com',
    createdAt: new Date().toISOString(),
    isMembership: false
}

const postInput: BlogCreatePostApiRequestModel = {
    title: 'post',
    content: 'Abcdefg',
    shortDescription: 'dsadadas'
}

describe('/blogs negative tests', () => {
    let createdBlogId: string;
    const randomId = new ObjectId()

    beforeAll(async () => {
        await runDB()
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        createdBlogId = await blogsRepository.createBlog(blogInput);
    })

    afterAll(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        await client.close();
        if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    it('should return empty array while GET posts for a certain blog, when no posts yet', async () => {
        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}/posts`)
            .expect(HTTP_STATUSES.OK_200)

        expect(getResponse.body).toEqual({
            "items": [],
            "page": 1,
            "pageSize": 10,
            "pagesCount": 1,
            "totalCount": 0
        })
    })

    it('should return 400 for GET by id not correct ObjectId', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/12345`)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'id',
                message: 'Blog ID should be an ObjectId type',
            }]
        })
    })

    it('should return 400 for DELETE by id not correct ObjectId', async () => {
        const response = await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/12345`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'id',
                message: 'Blog ID should be an ObjectId type',
            }]
        })
    })

    it('should return 400 for PUT by id not correct ObjectId', async () => {
        const response = await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/12345`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'id',
                message: 'Blog ID should be an ObjectId type',
            }]
        })
    })

    it('should return 404 for GET not existing blog', async () => {
        await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${randomId}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 404 for DELETE not existing blog', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/${randomId}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 404 for PUT not existing blog', async () => {
        const response = await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${randomId}`)
            .send(blogInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 400 for empty NAME while POST blog', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .send({ ...blogInput, name: '' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'name',
                message: 'Should not be empty',
            }]
        })
    })

    it('should return 404 for POST post for a not existing blog', async () => {
        await request
            .post(`${baseUrl}${CONFIG.PATH.BLOGS}/${randomId}/posts`)
            .send({ ...postInput })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('should return 400 for incorrect NAME type while POST blog', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .send({ ...blogInput, name: true })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'name',
                message: 'Should be a string',
            }]
        })
    })

    it('should return 400 for incorrect NAME length while POST blog', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .send({ ...blogInput, name: 'name567890123456' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'name',
                message: 'Max - 15 symbols',
            }]
        })
    })

    it('should return 400 for incorrect NAME length while POST blog', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .send({ ...blogInput, name: 'name567890123456' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'name',
                message: 'Max - 15 symbols',
            }]
        })
    })

    it('should return 400 for incorrect NAME while PUT blog', async () => {
        const editResponse = await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}`)
            .send({ ...blogInput, name: '' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(editResponse.body).toEqual({
            errorsMessages: [{
                field: 'name',
                message: 'Should not be empty',
            }]
        })
    })

    it('should return 400 for incorrect NAME while PUT blog', async () => {
        const editResponse = await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}`)
            .send({ ...blogInput, name: 'name567890123456' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(editResponse.body).toEqual({
            errorsMessages: [{
                field: 'name',
                message: 'Max - 15 symbols',
            }]
        })
    })

    it('should return 401 when no Auth Header for POST blog request', async () => {
        await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .send(blogInput)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 401 when no Auth Header for PUT blog request', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}`)
            .send(blogInput)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 401 when no Auth Header for DELETE blog request', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}`)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 401 when Auth Header is incorrect for DELETE blog request', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}`)
            .set('authorization', 'test')
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 400 while GET posts for a not existing blog', async () => {
        const objectId = new ObjectId()

        await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${objectId}/posts`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 400 for GET blog sortBy as number', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?sortBy=67`)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'sortBy',
                message: 'Should be a string',
            }]
        })
    })

    it('should return 400 for PUT blog invalid url', async () => {
        const response = await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlogId}`)
            .set('authorization', authHeader)
            .send({ ...blogInput, websiteUrl: 'http://localhost:8000/' })
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'websiteUrl',
                message: 'Should follow URL regex with HTTPS://, received http://localhost:8000/',
            }]
        })
    })
})
