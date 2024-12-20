import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {baseUrl} from "../constants";
import {usersTestManager} from "../users/usersTestManager";
import {HTTP_STATUSES} from "../../../src/common/utils/types";
import { UserApiRequestModel } from "../../../src/components/users/models/UserApiRequestModel";


export const authTestManager = {
    async loginByEmail(email: string, password: string): Promise<any> {
        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/login')
            .send({
                loginOrEmail: email,
                password: password
            })

        return {
            accessToken: response.body.accessToken,
            // TODO: how to get token normally
            refreshToken: response.headers['set-cookie'][0]
        }
    },

    async loginWithUserAgent(email: string, password: string, userAgent: string) {
        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/login')
            .set('user-agent', userAgent)
            .send({
                loginOrEmail: email,
                password
            })


        return {
            accessToken: response.body.accessToken,
            refreshToken: response.headers['set-cookie'][0],
        }
    },

    async getTokenOfLoggedInUser(inputLogin = 'userLogin', inputEmail = 'test@test.com'): Promise<string> {
        const user = {
            login: inputLogin,
            email: inputEmail,
            password: '123456'
        }

        await usersTestManager.createUser(user);

        const { accessToken } = await authTestManager.loginByEmail(user.email, user.password)

        return accessToken
    }
}