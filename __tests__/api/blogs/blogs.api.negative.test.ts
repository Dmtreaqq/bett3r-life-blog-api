import { agent } from 'supertest'
import { app } from '../../../src/app'
import { CONFIG } from "../../../src/config/config";
import { HTTP_STATUSES } from "../../../src/config/types";
import { PostInputModel } from "../../../src/models/PostModel";

export const request = agent(app)

const baseUrl = '/api';

const body: PostInputModel = {
    title: 'Doctor Who',
    content: 'Abcdefg',
    shortDescription: 'dsadadas',
    blogId: '123'
}

describe('/blogs negative tests', () => {
    beforeAll(async () => {
        await request.delete(`${baseUrl}/${CONFIG.PATH.TESTING}/all-data`);
    })

    it('should return 404 for GET not existing post', async () => {
        await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/999`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 404 for DELETE not existing post', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.POSTS}/999`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 404 for PUT not existing post', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/999`)
            .send({ title: 'New Title', author: 'New Author' })
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    // TODO ADD TEST FOR 401 NOT AUTHORIZED

    // TODO FIX AFTER ADDING express-validator
    // it('should return 400 for incorrect data while POST post', async () => {
    //     const response = await request
    //         .post(baseUrl + CONFIG.PATH.POSTS)
    //         .send({ title: 'Some Title' })
    //         .expect(HTTP_STATUSES.BAD_REQUEST_400);
    //
    //     expect(response.body).toEqual({
    //         errorsMessages: [{
    //             field: 'author',
    //             message: 'Field is required',
    //         }]
    //     })
    // })

    // it('should return 400 for incorrect data while PUT post', async () => {
    //     const createResponse = await request
    //         .post(baseUrl + CONFIG.PATH.POSTS)
    //         .send(body)
    //
    //     const { id } = createResponse.body
    //
    //     const editResponse = await request
    //         .put(`${baseUrl}${CONFIG.PATH.POSTS}/${id}`)
    //         .send({ title: 'Some Title' })
    //         .expect(HTTP_STATUSES.BAD_REQUEST_400);
    //
    //     expect(editResponse.body).toEqual({
    //         errorsMessages: [{
    //             field: 'author',
    //             message: 'Field is required',
    //         }]
    //     })
    // })
})