import { CONFIG } from "../../../src/utils/config";
import { HTTP_STATUSES } from "../../../src/utils/types";
import { blogsRepository } from "../../../src/components/blogs/repositories/blogsRepository";
import { fromUTF8ToBase64 } from "../../../src/middlewares/authMiddleware";
import { postsRepository } from "../../../src/components/posts/repositories/postsRepository";
import { client, runDB, server } from "../../../src/db/db";
import { request } from '../test-helper';
import { BlogDbModel } from "../../../src/components/blogs/models/BlogDbModel";
import { PostDbModel } from "../../../src/components/posts/models/PostDbModel";
import { ObjectId } from "mongodb";


const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const objectId = new ObjectId();

const blogInput: BlogDbModel = {
    // _id: new ObjectId(),
    name: 'Doctor Who Blog',
    description: 'Blog about Doctor Who',
    websiteUrl: 'https://doctor.who.com',
    createdAt: new Date().toISOString(),
    isMembership: false
} as BlogDbModel;

const postInput: PostDbModel = {
    blogName: blogInput.name,
    createdAt: new Date().toISOString(),
    title: 'Doctor Who',
    content: 'Abcdefg',
    shortDescription: 'dsadadas',
    blogId: objectId.toString()
} as PostDbModel;

describe('/posts negative tests', () => {
    let createdBlogId: string;
    let createdPostId: string;

    beforeAll(async () => {
        await runDB()
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);

        createdBlogId = await blogsRepository.createBlog(blogInput);
        createdPostId = await postsRepository.createPost({ ...postInput, blogId: createdBlogId })
    })

    afterAll(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        await client.close();
        if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    it('should return 404 for GET not existing post', async () => {
        await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${objectId}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 404 for DELETE not existing post', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.POSTS}/${objectId}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 404 for PUT not existing post', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${objectId}`)
            .send({ ...postInput, blogId: createdBlogId })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 400 for incorrect TITLE while POST post', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send({ ...postInput, blogId: createdBlogId, title: '' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'title',
                message: 'Should not be empty',
            }]
        })
    })

    it('should return 400 for incorrect TITLE length while POST post', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send({ ...postInput, blogId: createdBlogId, title: '31sym_789012345678901234567jjkkjjjkjk8901' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'title',
                message: 'Max - 30 symbols',
            }]
        })
    })

    it('should return 400 for not existing BlogId while POST post', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send(postInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'blogId',
                message: `Blog ${objectId} not found`,
            }]
        })
    })

    it('should return 400 for not incorrect BlogId while POST post', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send({...postInput, blogId: '123'})
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'blogId',
                message: 'Blog ID should be an ObjectId type',
            }]
        })
    })

    it('should return 400 for not incorrect BlogId while PUT post', async () => {
        const response = await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPostId}`)
            .send({...postInput, blogId: '123'})
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'blogId',
                message: 'Blog ID should be an ObjectId type',
            }]
        })
    })

    it('should return 400 for incorrect TITLE while PUT post', async () => {
        const editResponse = await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPostId}`)
            .send({ ...postInput, blogId: createdBlogId, title: '' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(editResponse.body).toEqual({
            errorsMessages: [{
                field: 'title',
                message: 'Should not be empty',
            }]
        })
    })

    it('should return 400 for incorrect TITLE length while PUT post', async () => {
        const editResponse = await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPostId}`)
            .send({ ...postInput, blogId: createdBlogId, title: '31sym_789012345678901234567jjkkjjjkjk8901' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(editResponse.body).toEqual({
            errorsMessages: [{
                field: 'title',
                message: 'Max - 30 symbols',
            }]
        })
    })

    it('should return 400 for incorrect POST_ID length while PUT post', async () => {
        const editResponse = await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/12345`)
            .send({ ...postInput, blogId: createdBlogId, title: 'new title' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(editResponse.body).toEqual({
            errorsMessages: [{
                field: 'id',
                message: 'Post ID should be an ObjectId type',
            }]
        })
    })

    it('should return 400 for incorrect POST_ID length while DELETE post', async () => {
        const editResponse = await request
            .delete(`${baseUrl}${CONFIG.PATH.POSTS}/12345`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(editResponse.body).toEqual({
            errorsMessages: [{
                field: 'id',
                message: 'Post ID should be an ObjectId type',
            }]
        })
    })

    it('should return 400 for incorrect POST_ID length while GET post', async () => {
        const editResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/12345`)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(editResponse.body).toEqual({
            errorsMessages: [{
                field: 'id',
                message: 'Post ID should be an ObjectId type',
            }]
        })
    })

    it('should return 401 when no Auth Header for POST post request', async () => {
        await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send(blogInput)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 401 when no Auth Header for PUT post request', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPostId}`)
            .send(blogInput)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 401 when no Auth Header for DELETE post request', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPostId}`)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 401 when Auth Header is incorrect for DELETE post request', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPostId}`)
            .set('authorization', 'Basic Test')
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 400 for GET post sortBy as number', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/?sortBy=67`)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'sortBy',
                message: 'Should be a string',
            }]
        })
    })
})
