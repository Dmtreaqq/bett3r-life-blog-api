import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {HTTP_STATUSES} from "../../../src/common/utils/types";
import {fromUTF8ToBase64} from "../../../src/common/middlewares/basicAuthMiddleware";
import {UserApiRequestModel, UserApiResponseModel} from "../../../src/components/users/models/UserApiModel";
import {client, runDB, server} from "../../../src/common/db/db";
import {UserDbModel} from "../../../src/components/users/models/UserDbModel";
import {usersRepository} from "../../../src/components/users/repositories/usersRepository";
import {ObjectId} from "mongodb";

const baseUrl = '/api';
const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;

const userInput: UserApiRequestModel = {
    login: 'login6', password: "123456", email: "test-email@ukr.net"
}

const userDbModel: UserDbModel = {
    email: userInput.email,
    login: userInput.login,
    password: userInput.password,
    createdAt: new Date().toISOString(),
    isConfirmed: false,
    confirmationCode: '1',
    expirationDate: '2'
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
                message: 'User already exists',
            }]
        })
    })

    it('should return 400 when POST a user with same EMAIL twice', async () => {
        await usersRepository.createUser({...userDbModel, login: 'anotherLogin'} as UserDbModel);

        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send(userInput)
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'email or login',
                message: 'User already exists',
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

    it('should return 400 when POST a user with incorrect LOGIN', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send({ ...userInput, login: 123 })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'login',
                message: 'Should be a string',
            }]
        })
    })

    it('should return 400 when POST a user with short LOGIN', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send({ ...userInput, login: 'c2' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'login',
                message: 'Min - 3, Max - 10 symbols',
            }]
        })
    })

    it('should return 400 when POST a user with long LOGIN', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send({ ...userInput, login: 'hellodima11' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'login',
                message: 'Min - 3, Max - 10 symbols',
            }]
        })
    })

    it('should return 400 when POST a user with incorrect PASSWORD', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send({ ...userInput, password: 123456 })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'password',
                message: 'Should be a string',
            }]
        })
    })

    it('should return 400 when POST a user with short PASSWORD', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send({ ...userInput, password: 'pass5' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'password',
                message: 'Min - 6, Max - 20 symbols',
            }]
        })
    })

    it('should return 400 when POST a user with long PASSWORD', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send({ ...userInput, password: 'a'.repeat(21) })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'password',
                message: 'Min - 6, Max - 20 symbols',
            }]
        })
    })

    it('should return 400 when POST a user with incorrect EMAIL', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send({ ...userInput, email: 'incorrect' })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'email',
                message: expect.any(String),
            }]
        })
    })

    it('should return 400 when POST a user with number EMAIL', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.USERS)
            .send({ ...userInput, email: 123456 })
            .set('authorization', authHeader)
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'email',
                message: 'Should be a string',
            }]
        })
    })
})
