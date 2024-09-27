import { CONFIG } from "../../../src/utils/config";
import { HTTP_STATUSES } from "../../../src/utils/types";
import { BlogInputModel, BlogViewModel } from "../../../src/models/BlogModel";
import { blogsRepository } from "../../../src/repositories/blogsInMemoryMongoRepository";
import { fromUTF8ToBase64 } from "../../../src/middlewares/authMiddleware";
import { client } from "../../../src/repositories/db";
import { request } from '../test-helper'


const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const blogInput: BlogInputModel = {
    name: 'SomeBlog',
    description: 'Some description',
    websiteUrl: 'https://somewebsite.com'
}

const blogEntity: BlogViewModel = {
    id: '1',
    name: blogInput.name,
    description: blogInput.description,
    websiteUrl: blogInput.websiteUrl,
    createdAt: "2024-09-25T13:47:55.913Z",
    isMembership: false
}

describe('/blogs positive', () => {
    let createdBlog: BlogViewModel;

    beforeAll(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        createdBlog = await blogsRepository.createBlog(blogInput);
    })

    afterAll(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        await client.close();
    })

    it('should POST a blog successfully', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.BLOGS)
            .send(blogInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.CREATED_201);

        expect(response.body).toEqual({
            ...blogInput,
            ...blogEntity,
            id: expect.any(String),
            createdAt: expect.any(String)
        })
    })

    it('should GET created blog successfully', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual(createdBlog)
    })

    it('should GET blogs successfully', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual(expect.arrayContaining([createdBlog]))
    })

    it('should PUT blog successfully', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .send(blogInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual({ ...createdBlog, ...blogInput })
    })

    it('should DELETE blog successfully', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })
})