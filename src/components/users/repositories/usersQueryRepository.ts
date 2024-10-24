import {UserApiResponseModel, UsersApiResponseModel} from "../models/UserApiModel";
import {UserDbModel} from "../models/UserDbModel";
import {Filter, ObjectId, WithId} from "mongodb";
import {usersCollection} from "../../../common/db/db";

export const usersQueryRepository = {
    async getUserById(id: string): Promise<UserApiResponseModel | null> {
        const user = await usersCollection.findOne({ _id: new ObjectId(id) })

        if (!user) return null;

        return this._mapFromDbModelToResponseModel(user);
    },

    async getUsers(login: string = '',
                   email: string = '',
                   pageNumber: number = 1,
                   pageSize: number = 10,
                   sortDirection: 'asc' | 'desc' = 'desc',
                   sortBy: string = 'createdAt',
    ): Promise<UsersApiResponseModel> {
        const filter: Filter<any> = {}

        if (login) {
            if (filter.$or) {
                filter.$or.push({
                    login: { $regex: login, $options: 'i' }
                })
            } else {
                filter.$or = [{login: { $regex: login, $options: 'i' }}]
            }
        }

        if (email) {
            if (filter.$or) {
                filter.$or.push({
                    email: { $regex: email, $options: 'i' }
                })
            } else {
                filter.$or = [{email: { $regex: email, $options: 'i' }}]
            }
        }

        const users = await usersCollection
            .find(filter)
            .sort(sortBy, sortDirection)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()

        const usersResponse = users.map(user => this._mapFromDbModelToResponseModel(user));
        const usersCount = await this.getUsersCount(login, email);

        return {
            items: usersResponse,
            page: Number(pageNumber),
            pageSize: Number(pageSize),
            totalCount: usersCount,
            pagesCount: usersCount <= pageSize ? 1 : Math.ceil(usersCount / Number(pageSize)),
        }
    },

    async getUsersCount(login: string, email: string): Promise<number> {
        const filter: Filter<any> = {}

        if (login) {
            if (filter.$or) {
                filter.$or.push({

                })
            } else {
                filter.$or = [{login: { $regex: login, $options: 'i' }}]
            }
        }

        if (email) {
            if (filter.$or) {
                filter.$or.push({
                    email: { $regex: email, $options: 'i' }
                })
            } else {
                filter.$or = [{email: { $regex: email, $options: 'i' }}]
            }
        }

        return usersCollection.countDocuments(filter)
    },

    _mapFromDbModelToResponseModel(userDbModel: WithId<UserDbModel>): UserApiResponseModel {
        return {
            id: userDbModel._id.toString(),
            email: userDbModel.email,
            login: userDbModel.login,
            createdAt: userDbModel.createdAt
        }
    }
}
