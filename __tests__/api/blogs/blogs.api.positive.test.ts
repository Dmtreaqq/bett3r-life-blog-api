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
    name: 'Somebody Who',
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

        await blogsRepository.createBlog({ ...blogInput, name: 'Doctor House' });
        await blogsRepository.createBlog({ ...blogInput, name: 'Doctor Who' });
        await blogsRepository.createBlog({ ...blogInput, name: 'Doctor Strange' });
        await blogsRepository.createBlog({ ...blogInput, name: 'Doctor Connors' });
        await blogsRepository.createBlog({ ...blogInput, name: 'Doctor Drake' });
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

    it('should GET blogs by searchNameTerm successfully', async () => {
        const newBlog = await blogsRepository.createBlog({ ...blogInput, name: 'Somebody House' });
        const responseNewBlog = blogsRepository.fromDbModelToResponseModel(newBlog);

        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?searchNameTerm=BODY`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response1.body).toEqual(expect.arrayContaining([createdBlogResponse, responseNewBlog]))

        const response2 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?searchNameTerm=body`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response2.body).toEqual(expect.arrayContaining([createdBlogResponse, responseNewBlog]))
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

    it('should GET blogs using sorting successfully', async () => {
        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?sortBy=name&sortDirection=desc&searchNameTerm=tor`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response1.body[0].name).toEqual('Doctor Who')

        const response2 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?sortBy=name&sortDirection=asc&searchNameTerm=tor`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response2.body[0].name).toEqual('Doctor Connors')
    })

    it('should GET blogs using pagination successfully', async () => {
        const response1 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?pageSize=2&searchNameTerm=tor`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response1.body).toHaveLength(2)

        const response2 = await request
            .get(`${baseUrl}${CONFIG.PATH.BLOGS}/?pageSize=2&pageNumber=3&searchNameTerm=tor`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response2.body).toHaveLength(1)
    })
})
