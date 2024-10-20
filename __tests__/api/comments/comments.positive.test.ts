import {request} from "../test-helper";
import {CONFIG} from "../../../src/utils/config";
import {HTTP_STATUSES} from "../../../src/utils/types";
import {fromUTF8ToBase64} from "../../../src/middlewares/authMiddleware";
import {client, runDB, server} from "../../../src/db/db";
import {ObjectId} from "mongodb";
import {CommentApiResponseModel} from "../../../src/components/comments/models/CommentApiModel";
import {CommentDbModel} from "../../../src/components/comments/models/CommentDbModel";
import {commentsRepository} from "../../../src/components/comments/repositories/commentsRepository";
import {jwtAuthService} from "../../../src/services/jwtService";
import {postsRepository} from "../../../src/components/posts/repositories/postsRepository";
import {blogsRepository} from "../../../src/components/blogs/repositories/blogsRepository";
import {BlogDbModel} from "../../../src/components/blogs/models/BlogDbModel";
import {PostDbModel} from "../../../src/components/posts/models/PostDbModel";

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
    content: 'Comment',
    commentatorInfo: {
        userId: '123',
        userLogin: 'userLogin'
    },
    createdAt: ""
}

const token = jwtAuthService.createToken({login: 'userLogin', email: 'email', id: '123'})

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
        const postId = await postsRepository.createPost(postInput)

        const response = await request
            .post(`${baseUrl}${CONFIG.PATH.POSTS}/${postId}${CONFIG.PATH.COMMENTS}`)
            .set('authorization', `Bearer ${token}`)
            .send({
                content: commentEntity.content
            })
            .expect(HTTP_STATUSES.CREATED_201);

        expect(response.body).toEqual({
            ...commentEntity,
            id: expect.any(String),
            createdAt: expect.any(String)
        })
    })

    it('should GET a comment successfully', async () => {
        const commentId = await commentsRepository.createComment({ ...commentDbModel, _id: new ObjectId()} as any)

        const response = await request
            .get(baseUrl + CONFIG.PATH.COMMENTS + `/${commentId}`)
            .set('authorization', `Bearer ${token}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual({
            ...commentEntity,
            id: expect.any(String),
            createdAt: expect.any(String)
        })
    })

    it('should DELETE a comment successfully', async () => {
        const commentId = await commentsRepository.createComment({ ...commentDbModel, _id: new ObjectId()} as any)

        await request
            .del(baseUrl + CONFIG.PATH.COMMENTS + `/${commentId}`)
            .set('authorization', `Bearer ${token}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .get(baseUrl + CONFIG.PATH.COMMENTS + `/${commentId}`)
            .set('authorization', `Bearer ${token}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })
})
