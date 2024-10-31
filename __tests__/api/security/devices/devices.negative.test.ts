import {delay, request} from "../../test-helper";
import {baseUrl} from "../../constants";
import {CONFIG} from "../../../../src/common/utils/config";
import {client, runDB, server} from "../../../../src/common/db/db";
import {authTestManager} from "../../auth/authTestManager";
import {usersTestManager} from "../../users/usersTestManager";
import {HTTP_STATUSES} from "../../../../src/common/utils/types";
import {jwtAuthService} from "../../../../src/common/services/jwtService";
import {sessionsRepository} from "../../../../src/components/security/sessions/sessionsRepository";
import {UserApiResponseModel} from "../../../../src/components/users/models/UserApiModel";

describe('/security/devices Positive', () => {
    let refreshToken1: string
    let refreshToken2: string
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



        refreshToken1 = tokens1.refreshToken
        refreshToken2 = tokens2.refreshToken
    })

    afterAll(async() => {
        await request.del(baseUrl + CONFIG.PATH.TESTING + '/all-data')
        await client.close();

        if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    afterEach(async () => {
        // await request.del(baseUrl + CONFIG.PATH.TESTING + '/all-data')
    })

    it('Should return 404 while delete not existing deviceId session', async () => {
        const response = await request
            .delete(baseUrl + CONFIG.PATH.SECURITY + '/devices/12345')
            .set('Cookie', [refreshToken1])
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Should return 403 while delete not yours deviceId session', async () => {
        const deviceSessions = await sessionsRepository.getAllSessions(user2.id)
        const { deviceId } = deviceSessions.find(session => session.userId === user2.id)!

        await request
            .delete(baseUrl + CONFIG.PATH.SECURITY + `/devices/${deviceId}`)
            .set('Cookie', [refreshToken1])
            .expect(HTTP_STATUSES.FORBIDDEN_403)
    })
})