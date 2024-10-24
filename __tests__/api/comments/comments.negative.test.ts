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


describe('/comments Negative', () => {
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

    it('should return 400 while POST a comment with invalid post ID', async () => {
        const token = await authTestManager.getTokenOfLoggedInUser()

        const response = await request
            .post(`${baseUrl}${CONFIG.PATH.POSTS}/invalid${CONFIG.PATH.COMMENTS}`)
            .set('authorization', `Bearer ${token}`)
            .send({
                content: commentEntity.content
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [
                {
                    field: 'id',
                    message: 'Post ID should be an ObjectId type'
                }
            ]
        })
    })

    it('should return 400 while GET comments from post with invalid post ID', async () => {
        const token = await authTestManager.getTokenOfLoggedInUser()

        const response = await request
            .get(`${baseUrl}${CONFIG.PATH.POSTS}/invalid${CONFIG.PATH.COMMENTS}`)
            .send({
                content: commentEntity.content
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [
                {
                    field: 'id',
                    message: 'Post ID should be an ObjectId type'
                }
            ]
        })
    })

    it('should return 400 while GET a comment with invalid commentId', async () => {
        const response = await request
            .get(baseUrl + CONFIG.PATH.COMMENTS + `/invalidCommentId`)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [
                {
                    field: 'id',
                    message: 'Comment ID should be an ObjectId type'
                }
            ]
        })
    })

    it('should return 400 while PUT a comment with invalid commentId', async () => {
        const token = await authTestManager.getTokenOfLoggedInUser()

        const response = await request
            .put(baseUrl + CONFIG.PATH.COMMENTS + `/invalidCommentId`)
            .set('authorization', `Bearer ${token}`)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [
                {
                    field: 'id',
                    message: 'Comment ID should be an ObjectId type'
                }
            ]
        })
    })

    it('should return 400 while DELETE a comment with invalid commentId', async () => {
        const token = await authTestManager.getTokenOfLoggedInUser()

        const response = await request
            .delete(baseUrl + CONFIG.PATH.COMMENTS + `/invalidCommentId`)
            .set('authorization', `Bearer ${token}`)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [
                {
                    field: 'id',
                    message: 'Comment ID should be an ObjectId type'
                }
            ]
        })
    })
})
