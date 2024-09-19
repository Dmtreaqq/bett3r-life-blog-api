import { agent } from 'supertest'
import { app } from '../../../src/app'
import { CONFIG } from "../../../src/utils/config";
import { HTTP_STATUSES } from "../../../src/utils/types";
import { BlogInputModel, BlogViewModel } from "../../../src/models/BlogModel";

export const request = agent(app)

const baseUrl = '/api';

const body: BlogInputModel = {
    name: 'SomeBlog',
    description: 'Some description',
    websiteUrl: 'https://somewebsite.com'
}

const responseBody: BlogViewModel = {
    id: '1',
    name: body.name,
    description: body.description,
    websiteUrl: body.websiteUrl,
}

describe('/blogs positive', () => {
    beforeAll(async () => {
        await request.delete(`${baseUrl}/${CONFIG.PATH.TESTING}/all-data`);
    })

    let createdBlog: BlogViewModel;

    it('should GET empty array', async () => {
        const response = await request
            .get(baseUrl + CONFIG.PATH.BLOGS)
            .expect(HTTP_STATUSES.OK_200)

        expect(response.body.length).toBe(0)
    })

    it('should POST a blog successfully', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .send(body)
            .expect(HTTP_STATUSES.CREATED_201);

        createdBlog = response.body;

        expect(response.body).toEqual({
            ...body,
            ...responseBody,
            id: expect.any(String),
        })
    })

    it('should GET created blog successfully', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual(createdBlog)
    })

    it('should GET post array including created blog', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual([createdBlog])
    })

    it('should PUT blog successfully', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .send(body)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual({ ...createdBlog, ...body })
    })

    it('should DELETE blog successfully', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })
})