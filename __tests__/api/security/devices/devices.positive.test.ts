import {delay, request} from "../../test-helper";
import {baseUrl} from "../../constants";
import {CONFIG} from "../../../../src/common/utils/config";
import {client, runDB, server} from "../../../../src/common/db/db";
import {authTestManager} from "../../auth/authTestManager";
import {usersTestManager} from "../../users/usersTestManager";
import {HTTP_STATUSES} from "../../../../src/common/utils/types";
import {sessionsRepository} from "../../../../src/components/security/sessions/sessionsRepository";
import {UserApiResponseModel} from "../../../../src/components/users/models/UserApiModel";

describe('/security/devices Positive', () => {
    let refreshToken1: string
    let refreshToken2: string
    let refreshToken3: string
    let refreshToken4: string
    let user: UserApiResponseModel
    let responseSessions1: any

    beforeAll(async () => {
        await runDB()
        await request.del(baseUrl + CONFIG.PATH.TESTING + '/all-data')

        user = await usersTestManager.createUser()
        const tokens1 = await authTestManager
            .loginWithUserAgent(user.email, 'password', 'iPhone')
        const tokens2 = await authTestManager.loginWithUserAgent(user.email, 'password', 'Android')
        const tokens3 = await authTestManager.loginWithUserAgent(user.email, 'password', 'Web')
        const tokens4 = await authTestManager.loginWithUserAgent(user.email, 'password', 'Blackberry')

        refreshToken1 = tokens1.refreshToken
        refreshToken2 = tokens2.refreshToken
        refreshToken3 = tokens3.refreshToken
        refreshToken4 = tokens4.refreshToken
    })

    afterAll(async() => {
        await request.del(baseUrl + CONFIG.PATH.TESTING + '/all-data')
        await client.close();

        if (CONFIG.IS_API_TEST === 'true') await server.stop();
    })

    afterEach(async () => {
        // await request.del(baseUrl + CONFIG.PATH.TESTING + '/all-data')
    })

    it('Should get ALL sessions successfully with editing 1 session', async () => {
        responseSessions1 = await request
            .get(baseUrl + CONFIG.PATH.SECURITY + '/devices')
            .set('Cookie', [refreshToken1])
            .expect(HTTP_STATUSES.OK_200)

        expect(responseSessions1.body).toEqual([
            {
                title: 'iPhone',
                ip: expect.any(String),
                lastActiveDate: expect.any(String),
                deviceId: expect.any(String)
            },
            {
                title: 'Android',
                ip: expect.any(String),
                lastActiveDate: expect.any(String),
                deviceId: expect.any(String)
            },
            {
                title: 'Web',
                ip: expect.any(String),
                lastActiveDate: expect.any(String),
                deviceId: expect.any(String)
            },
            {
                title: 'Blackberry',
                ip: expect.any(String),
                lastActiveDate: expect.any(String),
                deviceId: expect.any(String)
            }
        ])

        await delay(3000)

        const response = await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/refresh-token')
            .set('Cookie', [refreshToken1])
            .expect(HTTP_STATUSES.OK_200)

        const newToken = response.headers['set-cookie'][0]
        const responseSessions2 = await request
            .get(baseUrl + CONFIG.PATH.SECURITY + '/devices')
            .set('Cookie', [newToken])
            .expect(HTTP_STATUSES.OK_200)

        const firstSessionFromFirstReq = responseSessions1.body[0]

        expect(firstSessionFromFirstReq.lastActiveDate).not.toEqual(responseSessions2.body[0].lastActiveDate)
        expect(firstSessionFromFirstReq).toEqual({
            lastActiveDate: expect.any(String),
            ip: firstSessionFromFirstReq.ip,
            title: firstSessionFromFirstReq.title,
            deviceId: firstSessionFromFirstReq.deviceId
        })
        expect(responseSessions2.body.length).toEqual(responseSessions1.body.length)
        expect(responseSessions1.body.slice(1)).toEqual(responseSessions2.body.slice(1))
    })

    it('Should logout device and not showing that session', async () => {
        await request
            .post(baseUrl + CONFIG.PATH.AUTH + '/logout')
            .set('Cookie', [refreshToken3])
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const responseSessions1 = await request
            .get(baseUrl + CONFIG.PATH.SECURITY + '/devices')
            .set('Cookie', [refreshToken4])
            .expect(HTTP_STATUSES.OK_200)

        // Check third SESSION deleted
        expect(responseSessions1.body.some((obj: { title: string; }) => obj.title === 'Web')).toEqual(false)
    })

    it('Should return 204 while delete yours deviceId session', async () => {
        await request
            .delete(baseUrl + CONFIG.PATH.SECURITY + `/devices/${responseSessions1.body[1].deviceId}`)
            .set('Cookie', [refreshToken4])
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const responseSessions3 = await request
            .get(baseUrl + CONFIG.PATH.SECURITY + '/devices')
            .set('Cookie', [refreshToken4])
            .expect(HTTP_STATUSES.OK_200)

        // Check third SESSION deleted
        expect(responseSessions3.body.some((obj: { title: string; }) => obj.title === 'Android')).toEqual(false)
    })
})