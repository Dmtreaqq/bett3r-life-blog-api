import {sessionsCollection} from "../../../common/db/db";
import {SessionDbModel} from "./models/SessionDbModel";

export const sessionsRepository = {
    async createSession(sessionDbModel: SessionDbModel) {
        await sessionsCollection.insertOne(sessionDbModel)
    },

    async updateSession(deviceId: string, issuedAt: number, newIssuedAt: number, expDate: number) {
        const result = await sessionsCollection.updateOne({ issuedAt, deviceId }, {
            $set: { issuedAt: newIssuedAt, expirationDate: expDate }
        })

        return result.modifiedCount === 1
    },

    async isActiveSession(deviceId: string, issuedAt: number) {
        const session = await sessionsCollection.findOne({
            deviceId,
            issuedAt
        })

        return session
    },

    async deleteSession(deviceId: string, issuedAt: number) {
        const result = await sessionsCollection.deleteOne({
            deviceId, issuedAt
        })

        return result.deletedCount === 1
    },

    async getAllSessions(userId: string): Promise<SessionDbModel[]> {
        return sessionsCollection.find({ userId }).toArray()
    },

    async getSessionByDeviceId(deviceId: string) {
        // TODO а если с одного девайса 2 сессии
        return sessionsCollection.findOne({ deviceId })
    },

    async deleteAllSessions() {
        await sessionsCollection.deleteMany({})
    }
}