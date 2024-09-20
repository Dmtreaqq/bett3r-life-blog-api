import { agent } from 'supertest'
import { app } from '../../../src/app'
import { CONFIG } from "../../../src/utils/config";
import { HTTP_STATUSES } from "../../../src/utils/types";
import { PostInputModel } from "../../../src/models/PostModel";
import { BlogInputModel, BlogViewModel } from "../../../src/models/BlogModel";
import { fromUTF8ToBase64 } from "../../../src/middlewares/authMiddleware";
import { blogsRepository } from "../../../src/repositories/blogsRepository";

export const request = agent(app)

const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const blogInput: BlogInputModel = {
    name: 'SomeBlog',
    description: 'Some description',
    websiteUrl: 'https://somewebsite.com'
}

let createdBlog: BlogViewModel;

describe('/blogs negative tests', () => {
    beforeAll(async () => {
        await request.delete(`${baseUrl}/${CONFIG.PATH.TESTING}/all-data`);
        createdBlog = blogsRepository.createBlog(blogInput);
    })

    it('should return 404 for GET not existing blog', async () => {
        await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/999`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 404 for DELETE not existing blog', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/999`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 404 for PUT not existing blog', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/999`)
            .send(blogInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    // TODO ADD TEST FOR 401 NOT AUTHORIZED

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
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
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
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
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
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .send(blogInput)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 401 when no Auth Header for DELETE blog request', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 401 when Auth Header is incorrect for DELETE blog request', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .set('authorization', 'test')
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })
})