import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {HTTP_STATUSES} from "../../../src/common/utils/types";
import {runDB} from "../../../src/common/db/db";
import {usersRepository} from "../../../src/components/users/repositories/usersRepository";
import {UserDbModel} from "../../../src/components/users/models/UserDbModel";
import {ObjectId} from "mongodb";
import {emailService} from "../../../src/common/services/emailService";
import {authService} from "../../../src/components/auth/authService";
import { sub } from 'date-fns';
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { AuthLoginApiRequestModel } from "../../../src/components/auth/models/AuthLoginApiRequestModel";

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
    isConfirmed: false,
    expirationDate: '1',
    confirmationCode: '1',
    recoveryCode: randomUUID(),
    recoveryCodeExpirationDate: ''
}

describe('/auth negative', () => {
    beforeAll(async () => {
        await runDB()
    })

    afterAll(async () => {
        await mongoose.disconnect();

        // if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    afterEach(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
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

        await request
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

    it ('should return 400 when POST registration confirmation with wrong code', async () => {
        jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValue()
        await authService.register({ login: 'regLogin', email: 'testemail@gmail.com', password: '123456' })

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/registration-confirmation')
            .send({ code: 'wrongCode' })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'code',
                message: 'Bad Request - No User'
            }]
        })
    })

    it ('should return 400 when POST registration confirmation with already confirmed user', async () => {
        jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValue()
        await authService.register({ login: 'login', email: 'testemail@gmail.com', password: '123456' })
        const registeredUser = await usersRepository.getUserByLogin('login')

        await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/registration-confirmation')
            .send({ code: registeredUser!.confirmationCode })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/registration-confirmation')
            .send({ code: registeredUser!.confirmationCode })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'code',
                message: 'User already confirmed'
            }]
        })
    })

    it ('should return 400 when POST registration confirmation when code is expired', async () => {
        await usersRepository.createUser({
            ...userDbModel,
            confirmationCode: '12345',
            expirationDate: sub(new Date(), { minutes: 4 }).toISOString()
        })

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/registration-confirmation')
            .send({ code: '12345' })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'code',
                message: 'Code is expired'
            }]
        })
    })

    it ('should return 400 when POST registration confirmation with empty code', async () => {
        jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValue()
        await authService.register({ login: 'regLogin', email: 'testemail@gmail.com', password: '123456' })

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/registration-confirmation')
            .send({ code: '' })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'code',
                message: 'Should not be empty'
            }]
        })
    })

    it ('should return 400 when POST registration confirmation with numeric code', async () => {
        jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValue()
        await authService.register({ login: 'regLogin', email: 'testemail@gmail.com', password: '123456' })

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/registration-confirmation')
            .send({ code: 12345 })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'code',
                message: 'Should be a string'
            }]
        })
    })

    it ('should return 400 when POST email resend with already confirmed user', async () => {
        jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValue()
        await authService.register({ login: 'login', email: 'testemail@gmail.com', password: '123456' })
        const registeredUser = await usersRepository.getUserByLogin('login')

        await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/registration-confirmation')
            .send({ code: registeredUser!.confirmationCode })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/registration-email-resending')
            .send({ email: registeredUser!.email })
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'email',
                message: 'User already confirmed'
            }]
        })
    })

    it ('should return 400 when POST email resend with not existing user', async () => {
        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/registration-email-resending')
            .send({ email: 'notexists@gmail.com' })
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'email',
                message: 'Bad Request - No User'
            }]
        })
    })

    it ('should return 204 when POST successful email send while password recover with NOT EXISTING user', async () => {
        const sendEmailMock = jest.spyOn(emailService, 'sendRecoverPasswordEmail').mockResolvedValue()

        await request
          .post(baseUrl + CONFIG.PATH.AUTH + '/password-recovery')
          .send({ email: 'someemail@gmail.com' })
          .expect(HTTP_STATUSES.NO_CONTENT_204);

        expect(sendEmailMock).toHaveBeenCalledTimes(0);
    })

    it ('should return 400 when POST new-password with incorrect recover code', async () => {
        const response = await request
          .post(baseUrl + CONFIG.PATH.AUTH + '/new-password')
          .send({ recoveryCode: 'incorrect code', newPassword: '654321' })
          .expect(HTTP_STATUSES.BAD_REQUEST_400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: 'recoveryCode',
                message: 'incorrect'
            }]
        })
    })
})
