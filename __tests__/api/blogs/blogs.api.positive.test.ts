import { CONFIG } from "../../../src/utils/config";
import { HTTP_STATUSES } from "../../../src/utils/types";
import { BlogApiRequestModel, BlogApiResponseModel } from "../../../src/components/blogs/models/BlogApiModel";
import { blogsRepository } from "../../../src/components/blogs/blogsRepository";
import { fromUTF8ToBase64 } from "../../../src/middlewares/authMiddleware";
import { client, runDB } from "../../../src/db/db";
import { request } from '../test-helper'
import { server } from "../../../src/db/db";
import { BlogDbModel } from "../../../src/components/blogs/models/BlogDbModel";


const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const blogInput: BlogApiRequestModel = {
    name: 'SomeBlog',
    description: 'Some description',
    websiteUrl: 'https://somewebsite.com'
}

const blogEntity: BlogApiResponseModel = {
    id: '1',
    name: blogInput.name,
    description: blogInput.description,
    websiteUrl: blogInput.websiteUrl,
    createdAt: "2024-09-25T13:47:55.913Z",
    isMembership: false
}



describe('/blogs positive', () => {
    let createdBlog: BlogDbModel;
    let createdBlogResponse: BlogApiResponseModel;

    beforeAll(async () => {
        await runDB()
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        createdBlog = await blogsRepository.createBlog(blogInput);
        createdBlogResponse = blogsRepository.fromDbModelToResponseModel(createdBlog)
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
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog._id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual(createdBlogResponse);
    })

    it('should GET blogs successfully', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual(expect.arrayContaining([createdBlogResponse]))
    })

    it('should PUT blog successfully', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog._id}`)
            .send(blogInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog._id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual(createdBlogResponse);
    })

    it('should DELETE blog successfully', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog._id}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/${createdBlog._id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })
})