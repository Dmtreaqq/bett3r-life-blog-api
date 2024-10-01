import { CONFIG } from "../../../src/utils/config";
import { HTTP_STATUSES } from "../../../src/utils/types";
import { PostApiRequestModel, PostApiResponseModel } from "../../../src/components/posts/models/PostApiModel";
import { blogsRepository } from "../../../src/components/blogs/blogsRepository";
import { BlogApiRequestModel } from "../../../src/components/blogs/models/BlogApiModel";
import { fromUTF8ToBase64 } from "../../../src/middlewares/authMiddleware";
import { postsRepository } from "../../../src/components/posts/postsRepository";
import { client, runDB, server } from "../../../src/db/db";
import { request } from '../test-helper';
import { PostDbModel } from "../../../src/components/posts/models/PostDbModel";
import { BlogDbModel } from "../../../src/components/blogs/models/BlogDbModel";

const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const blogInput: BlogApiRequestModel = {
    name: 'Doctor Who Blog',
    description: 'Blog about Doctor Who',
    websiteUrl: 'https://doctor.who.com',
}

const postInput: PostApiRequestModel = {
    title: 'Doctor Who article',
    content: 'Abcdefg',
    shortDescription: 'dsadadas',
    blogId: '123'
}

const postEntity: PostApiResponseModel = {
    id: '???',
    title: postInput.title,
    content: postInput.content,
    shortDescription: postInput.shortDescription,
    blogId: '???',
    blogName: '???',
    createdAt: "2024-09-25T13:47:55.913Z",
}

describe('/posts positive', () => {
    let createdPost: PostDbModel;
    let createdBlog: BlogDbModel;
    let createdPostResponse: PostApiResponseModel;

    beforeAll(async () => {
        await runDB()
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);

        createdBlog = await blogsRepository.createBlog(blogInput);
        createdPost = await postsRepository.createPost({ ...postInput, blogId: createdBlog._id.toString() })
        createdPostResponse = postsRepository.fromDbModelToResponseModel(createdPost)
    })

    afterAll(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
        await client.close();
        if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    it('should POST a post successfully', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.POSTS)
            .send({ ...postInput, blogId: createdBlog._id.toString() })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.CREATED_201);

        expect(response.body).toEqual({
            ...postEntity,
            blogName: createdBlog.name,
            blogId: createdBlog._id.toString(),
            id: expect.any(String),
            createdAt: expect.any(String),
        })
    })

    it('should GET created post successfully', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost._id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual(createdPostResponse)
    })

    it('should GET post array including created post', async () => {
        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual(expect.arrayContaining([createdPostResponse]))
    })

    it('should PUT post successfully', async () => {
        const editedPostInput: PostApiRequestModel = {
            blogId: createdBlog._id.toString(),
            title: 'Doctor House',
            content: 'Video',
            shortDescription: 'TV series about a doctor House'
        }

        await request
            .put(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost._id}`)
            .send(editedPostInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const getResponse = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost._id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual({ ...createdPostResponse, ...editedPostInput });
    })

    it('should DELETE post successfully', async () => {
        await request
            .delete(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost._id}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${createdPost._id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })
})