import { agent } from 'supertest'
import { app } from '../../../src/app'
import { CONFIG } from "../../../src/utils/config";
import { HTTP_STATUSES } from "../../../src/utils/types";
import { PostInputModel, PostViewModel } from "../../../src/models/PostModel";
import { BlogInputModel, BlogViewModel } from "../../../src/models/BlogModel";
import { blogsRepository } from "../../../src/repositories/blogsRepository";
import { fromUTF8ToBase64 } from "../../../src/middlewares/authMiddleware";
import { postsRepository } from "../../../src/repositories/postsRepository";
import { client, runDB, server } from "../../../src/repositories/db";
import { request } from '../test-helper';


const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const postInput: PostInputModel = {
    title: 'Doctor Who',
    content: 'Abcdefg',
    shortDescription: 'dsadadas',
    blogId: '123'
}

const blogInput: BlogInputModel = {
    name: 'Doctor Who Blog',
    description: 'Blog about Doctor Who',
    websiteUrl: 'https://doctor.who.com',
}

describe('/posts negative tests', () => {
    let createdBlog: BlogViewModel;
    let createdPost: PostViewModel;

    beforeAll(async () => {
        await runDB()
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);

        createdBlog = await blogsRepository.createBlog(blogInput);
        createdPost = await postsRepository.createPost({ ...postInput, blogId: createdBlog.id })
    })

    afterAll(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        await client.close();
        await server.stop();
    })

    it('should return 404 for GET not existing post', async () => {
        await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/999`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 404 for DELETE not existing post', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.POSTS}/999`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 404 for PUT not existing post', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/999`)
            .send({ ...postInput, blogId: createdBlog.id })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 400 for incorrect TITLE while POST post', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send({ ...postInput, blogId: createdBlog.id, title: '' })
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
            .send({ ...postInput, blogId: createdBlog.id, title: '31sym_789012345678901234567jjkkjjjkjk8901' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'title',
                message: 'Max - 30 symbols',
            }]
        })
    })

    it('should return 400 for incorrect BlogId while POST post', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send(postInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'blogId',
                message: 'Blog 123 not found',
            }]
        })
    })

    it('should return 400 for incorrect TITLE while PUT post', async () => {
        const editResponse = await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .send({ ...postInput, blogId: createdBlog.id, title: '' })
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
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .send({ ...postInput, blogId: createdBlog.id, title: '31sym_789012345678901234567jjkkjjjkjk8901' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(editResponse.body).toEqual({
            errorsMessages: [{
                field: 'title',
                message: 'Max - 30 symbols',
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
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .send(blogInput)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 401 when no Auth Header for DELETE post request', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 401 when Auth Header is incorrect for DELETE post request', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .set('authorization', 'Basic Test')
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })
})