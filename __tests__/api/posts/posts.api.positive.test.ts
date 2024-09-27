import { agent } from 'supertest'
import { app } from '../../../src/app'
import { CONFIG } from "../../../src/utils/config";
import { HTTP_STATUSES } from "../../../src/utils/types";
import { PostInputModel, PostViewModel } from "../../../src/models/PostModel";
import { blogsRepository } from "../../../src/repositories/blogsRepository";
import { BlogInputModel, BlogViewModel } from "../../../src/models/BlogModel";
import { fromUTF8ToBase64 } from "../../../src/middlewares/authMiddleware";
import { postsRepository } from "../../../src/repositories/postsRepository";
import { client, runDB, server } from "../../../src/repositories/db";
import { request } from '../test-helper';

const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const blogInput: BlogInputModel = {
    name: 'Doctor Who Blog',
    description: 'Blog about Doctor Who',
    websiteUrl: 'https://doctor.who.com',
}

const postInput: PostInputModel = {
    title: 'Doctor Who article',
    content: 'Abcdefg',
    shortDescription: 'dsadadas',
    blogId: '123'
}

const postEntity: PostViewModel = {
    id: '???',
    title: postInput.title,
    content: postInput.content,
    shortDescription: postInput.shortDescription,
    blogId: '???',
    blogName: '???',
    createdAt: "2024-09-25T13:47:55.913Z",
}

describe('/posts positive', () => {
    let createdPost: PostViewModel;
    let createdBlog: BlogViewModel;

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

    it('should POST a post successfully', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send({ ...postInput, blogId: createdBlog.id })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.CREATED_201);

        expect(response.body).toEqual({
            ...postInput,
            ...postEntity,
            blogName: createdBlog.name,
            blogId: createdBlog.id,
            id: expect.any(String),
            createdAt: expect.any(String),
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

        expect(response.body).toEqual(expect.arrayContaining([createdPost]))
    })

    it('should PUT post successfully', async () => {
        await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .send({ ...postInput, blogId: createdBlog.id })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual({ ...createdPost, ...postInput, blogId: createdBlog.id })
    })

    it('should DELETE post successfully', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })
})