import {usersCollection} from "../../../common/db/db";
import {UserDbModel} from "../models/UserDbModel";
import {ObjectId} from "mongodb";
import {add} from "date-fns/add";
import {randomUUID} from "node:crypto";

export const usersRepository = {
    async getUserById(userId: string) {
        return await usersCollection.findOne({ _id: new ObjectId(userId) })
    },

    async getUserByConfirmationCode(confirmCode: string) {
        return await usersCollection.findOne({ confirmationCode: confirmCode })
    },

    async updateConfirmation(userId: string): Promise<boolean> {
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { isConfirmed: true } }
        )

        return result.modifiedCount === 1
    },

    async updateCodeForEmail(userId: string): Promise<string> {
        const newCode = randomUUID()
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: {
                expirationDate: add(new Date(), { minutes: 5 }).toISOString(),
                confirmationCode: newCode
            }}
        )

        return newCode
    },

    async createUser(user: UserDbModel): Promise<string> {
        const { insertedId } = await usersCollection.insertOne(user)

        return insertedId.toString()
    },

    async deleteUserById(userId: string): Promise<boolean> {
        const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) })

        return result.deletedCount === 1
    },

    async deleteAllUsers() {
        await usersCollection.deleteMany({});
    },

    async getUserByEmail(email: string) {
        return usersCollection.findOne({email})
    },

    async getUserByLogin(login: string) {
        return usersCollection.findOne({login})
    }
}
