import {request} from "../test-helper";
import {CONFIG} from "../../../src/common/utils/config";
import {baseUrl} from "../constants";
import {usersTestManager} from "../users/usersTestManager";


export const authTestManager = {
    async loginByEmail(email: string, password: string): Promise<any> {
        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/login')
            .send({
                loginOrEmail: email,
                password: password
            })

        return response.body
    },

    async getTokenOfLoggedInUser(): Promise<string> {
        await usersTestManager.createUser({
            login: 'userLogin',
            email: 'test@test.com',
            password: '123456'
        });

        const { accessToken } = await authTestManager.loginByEmail('test@test.com', '123456')

        return accessToken
    }
}