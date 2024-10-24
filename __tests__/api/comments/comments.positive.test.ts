import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {HTTP_STATUSES} from "../../../src/common/utils/types";
import {client, runDB, server} from "../../../src/common/db/db";
import {ObjectId} from "mongodb";
import {CommentApiResponseModel} from "../../../src/components/comments/models/CommentApiModel";
import {CommentDbModel} from "../../../src/components/comments/models/CommentDbModel";
import {commentsRepository} from "../../../src/components/comments/repositories/commentsRepository";
import {postsRepository} from "../../../src/components/posts/repositories/postsRepository";
import {PostDbModel} from "../../../src/components/posts/models/PostDbModel";
import {commentsTestManager} from "./commentsTestManager";
import {postsTestManager} from "../posts/postsTestManager";
import {authTestManager} from "../auth/authTestManager";
import {blogsTestManager} from "../blogs/blogsTestManager";

const baseUrl = '/api';

const postInput: PostDbModel = {
    blogName: 'Name',
    createdAt: new Date().toISOString(),
    title: 'z 9',
    content: 'Abcdefg',
    shortDescription: 'dsadadas',
    blogId: '123'
} as PostDbModel;

const commentDbModel: CommentDbModel = {
    content: "Comment",
    commentatorInfo: {
        userId: '123',
        userLogin: 'userLogin'
    },
    createdAt: "",
    postId: ""
}

const commentEntity: CommentApiResponseModel = {
    id: "",
    content: 'Comment'.repeat(5),
    commentatorInfo: {
        userId: '123',
        userLogin: 'userLogin'
    },
    createdAt: ""
}


describe('/comments Positive', () => {
    beforeAll(async () => {
        await runDB()
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
    })

    afterAll(async () => {
        await client.close();

        if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    afterEach(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
    })

    it('should POST a comment successfully', async () => {
        const token = await authTestManager.getTokenOfLoggedInUser()
        const blog = await blogsTestManager.createBlog()
        const post = await postsTestManager.createPost(blog.id);

        const response = await request
            .post(`${baseUrl}${CONFIG.PATH.POSTS}/${post.id}${CONFIG.PATH.COMMENTS}`)
            .set('authorization', `Bearer ${token}`)
            .send({
                content: commentEntity.content
            })
            .expect(HTTP_STATUSES.CREATED_201);

        expect(response.body).toEqual({
            ...commentEntity,
            commentatorInfo: {
                ...commentEntity.commentatorInfo,
                userId: expect.any(String)
            },
            id: expect.any(String),
            createdAt: expect.any(String)
        })
    })

    it('should GET a comment successfully', async () => {
        const blog = await blogsTestManager.createBlog()
        const post = await postsTestManager.createPost(blog.id);
        const token = await authTestManager.getTokenOfLoggedInUser()
        const comment = await commentsTestManager.createComment(post.id, token)

        const response = await request
            .get(baseUrl + CONFIG.PATH.COMMENTS + `/${comment.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual({
            ...comment,
            content: comment.content,
            id: expect.any(String),
            createdAt: expect.any(String)
        })
    })

    it('should GET comments successfully', async () => {
        const postId = await postsRepository.createPost({...postInput, _id: new ObjectId()} as any)
        await commentsRepository.createComment({ ...commentDbModel, postId, _id: new ObjectId()} as any)
        await commentsRepository.createComment({ ...commentDbModel, postId, _id: new ObjectId()} as any)

        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/${postId}${CONFIG.PATH.COMMENTS}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual({
            page: 1,
            pageSize: 10,
            totalCount: 2,
            pagesCount: 1,
            items: expect.any(Array)
        })
    })

    it('should DELETE a comment successfully', async () => {
        const blog = await blogsTestManager.createBlog()
        const post = await postsTestManager.createPost(blog.id);
        const token = await authTestManager.getTokenOfLoggedInUser()
        const comment = await commentsTestManager.createComment(post.id, token)

        await request
            .del(baseUrl + CONFIG.PATH.COMMENTS + `/${comment.id}`)
            .set('authorization', `Bearer ${token}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .get(baseUrl + CONFIG.PATH.COMMENTS + `/${comment.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('should PUT a comment successfully', async () => {
        const blog = await blogsTestManager.createBlog()
        const post = await postsTestManager.createPost(blog.id);
        const token = await authTestManager.getTokenOfLoggedInUser();
        const comment = await commentsTestManager.createComment(post.id, token)

        await request
            .put(baseUrl + CONFIG.PATH.COMMENTS + `/${comment.id}`)
            .set('authorization', `Bearer ${token}`)
            .send({
                content: "This comment was changed because of test scenario"
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const getResponse = await request
            .get(baseUrl + CONFIG.PATH.COMMENTS + `/${comment.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(getResponse.body).toEqual({
            ...comment,
            id: expect.any(String),
            createdAt: expect.any(String),
            content: "This comment was changed because of test scenario"
        })
    })
})
