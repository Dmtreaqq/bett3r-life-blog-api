import { agent } from 'supertest'
import { app } from '../../../src/app'
import { CONFIG } from "../../../src/utils/config";
import { HTTP_STATUSES } from "../../../src/utils/types";
import { PostInputModel, PostViewModel } from "../../../src/models/PostModel";
import { blogsRepository } from "../../../src/repositories/blogsRepository";
import { BlogInputModel, BlogViewModel } from "../../../src/models/BlogModel";

export const request = agent(app)

const baseUrl = '/api';

const blog: BlogInputModel = {
    name: 'Doctor Who Blog',
    description: 'Blog about Doctor Who',
    websiteUrl: 'https://doctor.who.com',
}

const post: PostInputModel = {
    title: 'Doctor Who article',
    content: 'Abcdefg',
    shortDescription: 'dsadadas',
    blogId: '123'
}

const responseBody: PostViewModel = {
    id: '???',
    title: post.title,
    content: post.content,
    shortDescription: post.shortDescription,
    blogId: '???',
    blogName: '???'
}

describe('/posts positive', () => {
    beforeAll(async () => {
        await request.delete(`${baseUrl}/${CONFIG.PATH.TESTING}/all-data`);
    })

    let createdPost: PostViewModel;
    let createdBlog: BlogViewModel;

    it('should GET empty array', async () => {
        const response = await request
            .get(baseUrl + CONFIG.PATH.POSTS)
            .expect(HTTP_STATUSES.OK_200)

        expect(response.body.length).toBe(0)
    })

    it('should POST a post successfully', async () => {
        createdBlog = blogsRepository.createBlog(blog);

        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send({ ...post, blogId: createdBlog.id })
            .expect(HTTP_STATUSES.CREATED_201);

        createdPost = response.body;

        expect(response.body).toEqual({
            ...post,
            ...responseBody,
            blogName: createdBlog.name,
            blogId: createdBlog.id,
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
            .send({ ...post, blogId: createdBlog.id })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual({ ...createdPost, ...post, blogId: createdBlog.id })
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