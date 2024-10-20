import {request} from "../test-helper";
import {CONFIG} from "../../../src/utils/config";
import {HTTP_STATUSES} from "../../../src/utils/types";
import {fromUTF8ToBase64} from "../../../src/middlewares/authMiddleware";
import {UserApiRequestModel, UserApiResponseModel} from "../../../src/components/users/models/UserApiModel";
import {client, runDB, server} from "../../../src/db/db";
import {UserDbModel} from "../../../src/components/users/models/UserDbModel";
import {usersRepository} from "../../../src/components/users/repositories/usersRepository";
import {usersQueryRepository} from "../../../src/components/users/repositories/usersQueryRepository";
import {ObjectId} from "mongodb";
import {CommentApiResponseModel} from "../../../src/components/comments/models/CommentApiModel";
import {CommentDbModel} from "../../../src/components/comments/models/CommentDbModel";
import {commentsRepository} from "../../../src/components/comments/repositories/commentsRepository";


const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

// const userInput: UserApiRequestModel = {
//     login: 'login6', password: "123456", email: "test-email@ukr.net"
// }

const commentDbModel: CommentDbModel = {
    content: "Comment",
    commentatorInfo: {
        userId: '123',
        userLogin: 'userLogin'
    },
    createdAt: ""
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

    it('should GET a comment successfully', async () => {
        const commentId = await commentsRepository.createComment({ ...commentDbModel, _id: new ObjectId()} as any)

        const response = await request
            .get(baseUrl + CONFIG.PATH.COMMENTS + `/${commentId}`)
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
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .get(baseUrl + CONFIG.PATH.COMMENTS + `/${commentId}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    })
})
