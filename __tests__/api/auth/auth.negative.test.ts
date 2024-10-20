import {request} from "../test-helper";
import {CONFIG} from "../../../src/utils/config";
import {HTTP_STATUSES} from "../../../src/utils/types";
import {client, runDB, server} from "../../../src/db/db";

import {AuthLoginApiRequestModel} from "../../../src/components/auth/models/AuthApiModel";
import {usersRepository} from "../../../src/components/users/repositories/usersRepository";
import {UserDbModel} from "../../../src/components/users/models/UserDbModel";
import {ObjectId, WithId} from "mongodb";

const baseUrl = '/api';

const authInput: AuthLoginApiRequestModel = {
    loginOrEmail: 'login',
    password: '12345'
}

const userDbModel: UserDbModel = {
    email: 'some@test.net',
    login: authInput.loginOrEmail,
    password: authInput.password,
    createdAt: new Date().toISOString(),
}

describe('/auth negative', () => {
    beforeAll(async () => {
        await runDB()
    })

    afterAll(async () => {
        await client.close();

        if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    it('should return 401 while POST with incorrect password', async () => {
        await usersRepository.createUser(userDbModel);

        await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/login')
            .send({...authInput, password: '111'})
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 401 while POST with not existing loginOrEmail', async () => {
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/login')
            .send({...authInput, loginOrEmail: 'not-existing'})
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    it('should return 400 while POST with empty loginOrEmail', async () => {
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/login')
            .send({...authInput, loginOrEmail: ''})
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'loginOrEmail',
                message: 'Should not be empty'
            }]
        })
    })

    it('should return 400 while POST with empty password', async () => {
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/login')
            .send({...authInput, password: ''})
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'password',
                message: 'Should not be empty'
            }]
        })
    })

    it('should return 400 while POST with number loginOrEmail', async () => {
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/login')
            .send({...authInput, loginOrEmail: 123})
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'loginOrEmail',
                message: 'Should be a string'
            }]
        })
    })

    it('should return 400 while POST with number password', async () => {
        await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/login')
            .send({...authInput, password: 123})
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'password',
                message: 'Should be a string'
            }]
        })
    })
})
