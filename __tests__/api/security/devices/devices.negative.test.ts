import {request} from "../../test-helper";
import {baseUrl} from "../../constants";
import {CONFIG} from "../../../../src/common/utils/config";
import {runDB} from "../../../../src/common/db/db";
import {authTestManager} from "../../auth/authTestManager";
import {usersTestManager} from "../../users/usersTestManager";
import {HTTP_STATUSES} from "../../../../src/common/utils/types";
import {UserApiResponseModel} from "../../../../src/components/users/models/UserApiModel";
import { deviceQueryRepository } from "../../../../src/components/security/devices/deviceQueryRepository";
import mongoose from "mongoose";

describe('/security/devices Positive', () => {
    let cookieRefreshToken1: string
    let cookieRefreshToken2: string
    let user2: UserApiResponseModel

    beforeAll(async () => {
        await runDB()
        await request.del(baseUrl + CONFIG.PATH.TESTING + '/all-data')

        const user1 = await usersTestManager.createUser()
        const tokens1 = await authTestManager
            .loginWithUserAgent(user1.email, 'password', 'iPhone')

        user2 = await usersTestManager.createUser({
            email: 'new-email@test.com', login: 'newlogin12', password: '123456'
        })
        const tokens2 = await authTestManager
            .loginWithUserAgent(user2.email, '123456', 'iPhone')


        cookieRefreshToken1 = tokens1.refreshToken
        cookieRefreshToken2 = tokens2.refreshToken
    })

    afterAll(async() => {
        await request.del(baseUrl + CONFIG.PATH.TESTING + '/all-data')
        await mongoose.disconnect();

        // if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    afterEach(async () => {
        // await request.del(baseUrl + CONFIG.PATH.TESTING + '/all-data')
    })

    it('Should return 404 while delete not existing deviceId session', async () => {
        const response = await request
            .delete(baseUrl + CONFIG.PATH.SECURITY + '/devices/12345')
            .set('Cookie', [cookieRefreshToken1])
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Should return 403 while delete not yours deviceId session', async () => {
        const token = cookieRefreshToken2.split(';')[0].slice(13)
        const deviceSessions = await deviceQueryRepository.getAllDevices(token)

        await request
            .delete(baseUrl + CONFIG.PATH.SECURITY + `/devices/${deviceSessions[0].deviceId}`)
            .set('Cookie', [cookieRefreshToken1])
            .expect(HTTP_STATUSES.FORBIDDEN_403)
    })
})