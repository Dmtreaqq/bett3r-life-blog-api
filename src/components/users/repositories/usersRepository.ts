import {usersCollection} from "../../../db/db";
import {UserDbModel} from "../models/UserDbModel";
import {ObjectId} from "mongodb";

export const usersRepository = {
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
