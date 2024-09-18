import { agent } from 'supertest'
import { app } from '../../../src/app'
import { CONFIG } from "../../../src/config/config";
import { HTTP_STATUSES } from "../../../src/config/types";
import { PostInputModel, PostViewModel } from "../../../src/models/PostModel";

export const request = agent(app)

const baseUrl = '/api';

const body: PostInputModel = {
    title: 'Doctor Who',
    content: 'Abcdefg',
    shortDescription: 'dsadadas',
    blogId: '123'
}

const responseBody: PostViewModel = {
    id: '123',
    title: 'Doctor Who',
    content: 'Abcdefg',
    shortDescription: 'dsadadas',
    blogId: '123',
    blogName: '???'
}

describe('/posts positive', () => {
    beforeAll(async () => {
        await request.delete(`${baseUrl}/${CONFIG.PATH.TESTING}/all-data`);
    })

    let createdPost: PostViewModel;

    it('should GET empty array', async () => {
        const response = await request
            .get(baseUrl + CONFIG.PATH.POSTS)
            .expect(HTTP_STATUSES.OK_200)

        expect(response.body.length).toBe(0)
    })

    it('should POST a post successfully', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send(body)
            .expect(HTTP_STATUSES.CREATED_201);

        createdPost = response.body;

        expect(response.body).toEqual({
            ...body,
            ...responseBody,
            id: expect.any(String),
        })
    })

    it('should GET created post successfully', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual(createdPost)
    })

    it('should GET post array including created post', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual([createdPost])
    })

    it('should PUT post successfully', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .send(body)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual({ ...createdPost, ...body })
    })

    it('should DELETE post successfully', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })
})