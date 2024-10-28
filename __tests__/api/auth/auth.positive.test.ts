import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {HTTP_STATUSES} from "../../../src/common/utils/types";
import {client, runDB, server} from "../../../src/common/db/db";
import {AuthLoginApiRequestModel} from "../../../src/components/auth/models/AuthApiModel";
import {usersRepository} from "../../../src/components/users/repositories/usersRepository";
import {hashSync} from "bcrypt";
import {jwtAuthService} from "../../../src/common/services/jwtService";
import {ObjectId} from "mongodb";
import {authService} from "../../../src/components/auth/authService";
import {emailService} from "../../../src/common/services/emailService";

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
    beforeAll(async () => {
        await runDB()
    })

    afterAll(async () => {
        await client.close();

        if (CONFIG.IS_API_TEST === 'true') await server.stop();
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
            accessToken: jwtAuthService.createToken({
                id: userDbModel._id.toString()
            })
        })
    })

    it('should GET userInfo successfully', async () => {
        const userId = await usersRepository.createUser({ ...userDbModel, _id: new ObjectId() } as any);

        const token = jwtAuthService.createToken({
            id: userId,
            login: userDbModel.login,
            email: userDbModel.email,
            createdAt: userDbModel.createdAt
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

    it ('should return 204 when POST successful registration confirmation', async () => {
        jest.spyOn(emailService, 'sendConfirmationEmail').mockResolvedValue()
        await authService.register({ login: 'login', email: 'testemail2@gmail.com', password: '123456' })
        const registeredUser = await usersRepository.getUserByLogin('login')

        await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/registration-confirmation')
            .send({ code: registeredUser!.confirmationCode })
            .expect(HTTP_STATUSES.NO_CONTENT_204);
    })
})
