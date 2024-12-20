import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {HTTP_STATUSES} from "../../../src/common/utils/types";
import {runDB} from "../../../src/common/db/db";
import {UsersRepository} from "../../../src/components/users/repositories/usersRepository";
import {hashSync} from "bcrypt";
import {JwtAuthService} from "../../../src/common/services/jwtService";
import {ObjectId} from "mongodb";
import {AuthService} from "../../../src/components/auth/authService";
import {EmailService} from "../../../src/common/services/emailService";
import {authHeader} from "../constants";
import {usersTestManager} from "../users/usersTestManager";
import {authTestManager} from "./authTestManager";
import mongoose from "mongoose";
import { UserApiResponseModel } from "../../../src/components/users/models/UserApiResponseModel";
import { AuthLoginApiRequestModel } from "../../../src/components/auth/models/AuthLoginApiRequestModel";
import { AuthRegisterApiRequestModel } from "../../../src/components/auth/models/AuthRegisterApiRequestModel";
import { container } from "../../../src/composition-root";

const baseUrl = '/api';

const authInput: AuthLoginApiRequestModel = {
    loginOrEmail: 'login',
    password: '12345'
}

const hashedPassword = hashSync(authInput.password, 10)
const userDbModel = {
    _id: new ObjectId(),
    email: 'some@test.net',
    login: authInput.loginOrEmail,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
} as any


describe('/auth Positive', () => {
    let authService: AuthService;
    let usersRepository: UsersRepository;
    let jwtAuthService: JwtAuthService;
    let emailService: EmailService;
    beforeAll(async () => {
        await runDB()

        authService = container.resolve(AuthService)
        usersRepository = container.resolve(UsersRepository);
        jwtAuthService = new JwtAuthService();
        emailService = new EmailService();
    })

    afterAll(async () => {
        await mongoose.disconnect();

        // if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    afterEach(async () => {
        await request.delete(`${baseUrl}${CONFIG.PATH.TESTING}/all-data`);
    })

    it('should POST login successfully', async () => {
        await usersRepository.createUser(userDbModel);

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/login')
            .send(authInput)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual({
            accessToken: jwtAuthService.createAccessToken({
                id: userDbModel._id.toString()
            })
        })

        expect(response.headers['set-cookie'][0]).toMatch('refreshToken')
    })

    it('should GET userInfo successfully', async () => {
        const userId = await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);

        const token = jwtAuthService.createAccessToken({
            id: userId,
        })

        const response = await request
            .get(baseUrl + CONFIG.PATH.AUTH + '/me')
            .set('authorization', `Bearer ${token}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual({
            email: userDbModel.email,
            login: userDbModel.login,
            userId
        })
    })

    // it ('should return 204 when POST successful registration confirmation', async () => {
    //     jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValue()
    //     await authService.register({ login: 'login', email: 'testemail2@gmail.com', password: '123456' })
    //     const registeredUser = await usersRepository.getUserByLogin('login')

    //     await request
    //         .post(baseUrl + CONFIG.PATH.AUTH + '/registration-confirmation')
    //         .send({ code: registeredUser!.confirmationCode })
    //         .expect(HTTP_STATUSES.NO_CONTENT_204);
    // })

    // it ('should return 204 when POST successful email resend while confirm email', async () => {
    //     jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValue()
    //     await authService.register({ login: 'login', email: 'testemail2@gmail.com', password: '123456' })
    //     const registeredUser = await usersRepository.getUserByLogin('login')

    //     await request
    //         .post(baseUrl + CONFIG.PATH.AUTH + '/registration-email-resending')
    //         .send({ email: registeredUser!.email })
    //         .expect(HTTP_STATUSES.NO_CONTENT_204);
    // })

    // it ('should return 204 when POST successful registration', async () => {
    //     jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValue()

    //     await request
    //         .post(baseUrl + CONFIG.PATH.AUTH + '/registration')
    //         .send({
    //             email: 'new-email@test.com',
    //             login: 'new-login',
    //             password: '123456'
    //         } as AuthRegisterApiRequestModel)
    //         .expect(HTTP_STATUSES.NO_CONTENT_204);

    //     const response = await request
    //         .get(baseUrl + CONFIG.PATH.USERS)
    //         .set('authorization', authHeader)
    //         .expect(HTTP_STATUSES.OK_200)

    //     expect(response.body.items).toEqual([{
    //         id: expect.any(String),
    //         createdAt: expect.any(String),
    //         login: 'new-login',
    //         email: 'new-email@test.com',
    //     } as UserApiResponseModel])
    // })

    it ('should return 200 when POST refreshToken', async () => {
        const user = await usersTestManager.createUser()
        const {refreshToken} = await authTestManager.loginByEmail(user.email, 'password')

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/refresh-token')
            .set('Cookie', [refreshToken])
            .expect(HTTP_STATUSES.OK_200);

        expect(response.header['set-cookie'][0]).not.toEqual(refreshToken)
    })

    it ('should return 204 when POST logout', async () => {
        const user = await usersTestManager.createUser()
        const {refreshToken} = await authTestManager.loginByEmail(user.email, 'password')

        await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/logout')
            .set('Cookie', [refreshToken])
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/refresh-token')
            .set('Cookie', [refreshToken])
            .expect(HTTP_STATUSES.NOT_AUTHORIZED_401);
    })

    // it ('should return 204 when POST successful email send while password recover with EXISTING user', async () => {
    //     const sendEmailMock = jest.spyOn(emailService, 'sendRecoverPasswordEmail').mockResolvedValue()
    //     await authService.register({ login: 'login', email: 'testemail2@gmail.com', password: '123456' })
    //     const registeredUser = await usersRepository.getUserByLogin('login')

    //     await request
    //       .post(baseUrl + CONFIG.PATH.AUTH + '/password-recovery')
    //       .send({ email: registeredUser!.email })
    //       .expect(HTTP_STATUSES.NO_CONTENT_204);

    //     expect(sendEmailMock).toHaveBeenCalledTimes(1);
    // })

    // it ('should return 204 when POST successful new password confirmation', async () => {
    //     jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValue()
    //     await authService.register({ login: 'login', email: 'testemail2@gmail.com', password: '123456' })
    //     const registeredUser = await usersRepository.getUserByLogin('login')

    //     await request
    //       .post(baseUrl + CONFIG.PATH.AUTH + '/new-password')
    //       .send({ recoveryCode: registeredUser!.recoveryCode, newPassword: '654321' })
    //       .expect(HTTP_STATUSES.NO_CONTENT_204);
    // })
})
