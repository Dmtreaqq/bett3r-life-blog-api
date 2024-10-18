import {request} from "../test-helper";
import {CONFIG} from "../../../src/utils/config";
import {HTTP_STATUSES} from "../../../src/utils/types";
import {fromUTF8ToBase64} from "../../../src/middlewares/authMiddleware";
import {UserApiRequestModel, UserApiResponseModel} from "../../../src/components/users/models/UserApiModel";
import {client, runDB, server} from "../../../src/db/db";
import {UserDbModel} from "../../../src/components/users/models/UserDbModel";
import {usersRepository} from "../../../src/components/users/repositories/usersRepository";
import {usersQueryRepository} from "../../../src/components/users/repositories/usersQueryRepository";
import {blogsRepository} from "../../../src/components/blogs/repositories/blogsRepository";
import {ObjectId} from "mongodb";
import {blogsQueryRepository} from "../../../src/components/blogs/repositories/blogsQueryRepository";

const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const userInput: UserApiRequestModel = {
    login: 'login', password: "12345", email: "test-email@ukr.net"
}

const userDbModel: UserDbModel = {
    email: userInput.email,
    login: userInput.login,
    createdAt: new Date().toISOString(),
}

const userEntity: UserApiResponseModel = {
    id: "",
    email: userInput.email,
    login: userInput.login,
    createdAt: ""
}

describe('/users Negative', () => {
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

    it('should return 400 when POST a user with same LOGIN twice', async () => {
        await usersRepository.createUser({ ...userDbModel, email: 'another@test.test' } as UserDbModel);

        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send(userInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'email or login',
                message: 'User with such email or login already exists',
            }]
        })
    })

    it('should return 400 when POST a user with same EMAIL twice', async () => {
        await usersRepository.createUser({...userDbModel, login: 'another login'} as UserDbModel);

        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send(userInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'email or login',
                message: 'User with such email or login already exists',
            }]
        })
    })

    it('should return 400 when DELETE not existing user', async () => {
        const userId = new ObjectId()

         await request
            .del(`${baseUrl}${CONFIG.PATH.USERS}/${userId}`)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.NOT_FOUND_404);

    })
})
