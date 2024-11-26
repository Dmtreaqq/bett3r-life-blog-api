import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {HTTP_STATUSES} from "../../../src/common/utils/types";
import {runDB} from "../../../src/common/db/db";
import {ObjectId} from "mongodb";
import {commentsTestManager} from "./commentsTestManager";
import {postsTestManager} from "../posts/postsTestManager";
import {authTestManager} from "../auth/authTestManager";
import {blogsTestManager} from "../blogs/blogsTestManager";
import mongoose from "mongoose";
import { CommentApiResponseModel } from "../../../src/components/comments/models/CommentApiResponseModel";

const baseUrl = '/api';

const commentEntity: CommentApiResponseModel = {
    id: "",
    content: 'Comment'.repeat(5),
    commentatorInfo: {
        userId: '123',
        userLogin: 'userLogin'
    },
    createdAt: "",
    likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None"
    }
}


describe('/comments Negative', () => {
    beforeAll(async () => {
        await runDB()
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
    })

    afterAll(async () => {
        await mongoose.disconnect();

        // if (CONFIG.IS_API_TEST === 'true') await server.stop();
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
        const token = await authTestManager.getTokenOfLoggedInUser()

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

    it('should return 404 while POST a comment with not existing post ID', async () => {
        const token = await authTestManager.getTokenOfLoggedInUser()
        const notExistingPostId = new ObjectId()

        await request
            .post(`${baseUrl}${CONFIG.PATH.POSTS}/${notExistingPostId}${CONFIG.PATH.COMMENTS}`)
            .set('authorization', `Bearer ${token}`)
            .send({
                content: commentEntity.content
            })
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('should return 404 while DELETE not existing comment', async () => {
        const token = await authTestManager.getTokenOfLoggedInUser()
        const notExistingCommentId = new ObjectId()

        await request
            .delete(baseUrl + CONFIG.PATH.COMMENTS + `/${notExistingCommentId}`)
            .set('authorization', `Bearer ${token}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('should return 404 while PUT a comment with not existing commentId', async () => {
        const token = await authTestManager.getTokenOfLoggedInUser()
        const notExistingCommentId = new ObjectId()

        await request
            .put(baseUrl + CONFIG.PATH.COMMENTS + `/${notExistingCommentId}`)
            .set('authorization', `Bearer ${token}`)
            .send({ content: 'This is a content message that never will be sent' })
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })

    it('should return 403 while PUT not own comment', async () => {
        const blog = await blogsTestManager.createBlog()
        const post = await postsTestManager.createPost(blog.id);
        const token = await authTestManager.getTokenOfLoggedInUser();
        const someBodyElseToken = await authTestManager.getTokenOfLoggedInUser('superLogin', 'another@test.com')
        const comment = await commentsTestManager.createComment(post.id, someBodyElseToken)

        const response = await request
            .put(baseUrl + CONFIG.PATH.COMMENTS + `/${comment.id}`)
            .set('authorization', `Bearer ${token}`)
            .send({ content: 'This is a content message that never will be sent' })
            .expect(HTTP_STATUSES.FORBIDDEN_403);

        expect(response.body).toEqual({})
    })

    it('should return 403 while DELETE not own comment', async () => {
        const blog = await blogsTestManager.createBlog()
        const post = await postsTestManager.createPost(blog.id);
        const token = await authTestManager.getTokenOfLoggedInUser();
        const someBodyElseToken = await authTestManager.getTokenOfLoggedInUser('superLogin', 'another@test.com')
        const comment = await commentsTestManager.createComment(post.id, someBodyElseToken)

        const response = await request
            .del(baseUrl + CONFIG.PATH.COMMENTS + `/${comment.id}`)
            .set('authorization', `Bearer ${token}`)
            .expect(HTTP_STATUSES.FORBIDDEN_403);

        expect(response.body).toEqual({})
    })

    it('should PUT None comment successfully', async () => {
        const blog = await blogsTestManager.createBlog()
        const post = await postsTestManager.createPost(blog.id);
        const token = await authTestManager.getTokenOfLoggedInUser();
        const comment = await commentsTestManager.createComment(post.id, token)

        const response = await request
          .put(baseUrl + CONFIG.PATH.COMMENTS + `/${comment.id}/like-status`)
          .set('authorization', `Bearer ${token}`)
          .send({
              likeStatus: "ERROR"
          })
          .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: "likeStatus",
                message: "Needs to be None, Like, Dislike"
            }]
        })
    })
})
