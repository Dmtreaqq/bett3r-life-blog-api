import { agent } from 'supertest'
import { app } from '../../../src/app'
import { CONFIG } from "../../../src/utils/config";
import { HTTP_STATUSES } from "../../../src/utils/types";
import { PostInputModel } from "../../../src/models/PostModel";
import { BlogInputModel, BlogViewModel } from "../../../src/models/BlogModel";
import { blogsRepository } from "../../../src/repositories/blogsRepository";

export const request = agent(app)

const baseUrl = '/api';

const body: PostInputModel = {
    title: 'Doctor Who',
    content: 'Abcdefg',
    shortDescription: 'dsadadas',
    blogId: '123'
}

const blog: BlogInputModel = {
    name: 'Doctor Who Blog',
    description: 'Blog about Doctor Who',
    websiteUrl: 'https://doctor.who.com',
}

describe('/posts negative tests', () => {
    let createdBlog: BlogViewModel;

    beforeAll(async () => {
        await request.delete(`${baseUrl}/${CONFIG.PATH.TESTING}/all-data`);

        createdBlog = blogsRepository.createBlog(blog);
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
            .send({ ...body, blogId: createdBlog.id })
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    // TODO ADD TEST FOR 401 NOT AUTHORIZED

    it('should return 400 for incorrect TITLE while POST post', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send({ ...body, blogId: createdBlog.id, title: '' })
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
            .send({ ...body, blogId: createdBlog.id, title: '31sym_789012345678901234567jjkkjjjkjk8901' })
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
            .send(body)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'blogId',
                message: 'Blog 123 not found',
            }]
        })
    })

    it('should return 400 for incorrect TITLE while PUT post', async () => {
        const createResponse = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send({ ...body, blogId: createdBlog.id })

        const { id } = createResponse.body

        const editResponse = await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${id}`)
            .send({ ...body, blogId: createdBlog.id, title: '' })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(editResponse.body).toEqual({
            errorsMessages: [{
                field: 'title',
                message: 'Should not be empty',
            }]
        })
    })

    it('should return 400 for incorrect TITLE length while PUT post', async () => {
        const createResponse = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send(body)

        const { id } = createResponse.body

        const editResponse = await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${id}`)
            .send({ ...body, blogId: createdBlog.id, title: '31sym_789012345678901234567jjkkjjjkjk8901' })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(editResponse.body).toEqual({
            errorsMessages: [{
                field: 'title',
                message: 'Max - 30 symbols',
            }]
        })
    })
})