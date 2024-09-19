import { agent } from 'supertest'
import { app } from '../../../src/app'
import { CONFIG } from "../../../src/utils/config";
import { HTTP_STATUSES } from "../../../src/utils/types";
import { PostInputModel } from "../../../src/models/PostModel";
import { BlogInputModel } from "../../../src/models/BlogModel";

export const request = agent(app)

const baseUrl = '/api';

const body: BlogInputModel = {
    name: 'SomeBlog',
    description: 'Some description',
    websiteUrl: 'https://somewebsite.com'
}

describe('/blogs negative tests', () => {
    beforeAll(async () => {
        await request.delete(`${baseUrl}/${CONFIG.PATH.TESTING}/all-data`);
    })

    it('should return 404 for GET not existing blog', async () => {
        await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/999`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 404 for DELETE not existing blog', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/999`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 404 for PUT not existing blog', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/999`)
            .send(body)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    // TODO ADD TEST FOR 401 NOT AUTHORIZED

    it('should return 400 for incorrect TITLE while POST blog', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .send({ ...body, name: '' })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'name',
                message: 'Should not be empty',
            }]
        })
    })

    it('should return 400 for incorrect NAME length while POST blog', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .send({ ...body, name: 'name567890123456' })
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
            .send({ ...body, name: 'name567890123456' })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'name',
                message: 'Max - 15 symbols',
            }]
        })
    })

    it('should return 400 for incorrect NAME while PUT blog', async () => {
        const createResponse = await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .send(body)

        const { id } = createResponse.body

        const editResponse = await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${id}`)
            .send({ ...body, name: '' })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(editResponse.body).toEqual({
            errorsMessages: [{
                field: 'name',
                message: 'Should not be empty',
            }]
        })
    })

    it('should return 400 for incorrect NAME while PUT blog', async () => {
        const createResponse = await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .send(body)

        const { id } = createResponse.body

        const editResponse = await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${id}`)
            .send({ ...body, name: 'name567890123456' })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(editResponse.body).toEqual({
            errorsMessages: [{
                field: 'name',
                message: 'Max - 15 symbols',
            }]
        })
    })
})