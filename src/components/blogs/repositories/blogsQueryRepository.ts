import {BlogApiResponseModel, BlogsApiResponseModel} from "../models/BlogApiModel";
import {blogsCollection} from "../../../db/db";
import {BlogDbModel} from "../models/BlogDbModel";
import {Filter, ObjectId, WithId} from "mongodb";

export const blogsQueryRepository = {
    async getBlogById(id: string): Promise<BlogApiResponseModel | null> {
        // TODO: Ask. Do we need try/catch here???
        const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });

        if (!blog) return null

        return this._mapFromDbModelToResponseModel(blog)
    },

    async getBlogs(name: string = '', pageSize: number = 10, pageNumber: number = 1, sortBy: string = 'createdAt', sortDirection: 'asc' | 'desc' = 'desc'): Promise<BlogsApiResponseModel> {
        const filter: Filter<BlogDbModel> = {}

        if (name !== undefined) {
            filter.name = { $regex: name, $options: 'i' }
        }

        const blogs = await blogsCollection
            .find(filter)
            .sort(sortBy, sortDirection)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()

        const blogsCount = await this.getBlogsCount(name);
        const blogsResponse = blogs.map(blog => this._mapFromDbModelToResponseModel(blog))

        return {
            items: blogsResponse,
            page: pageNumber,
            pageSize,
            totalCount: blogsCount,
            pagesCount: blogsCount <= pageSize ? 1 : Math.ceil(blogsCount / pageSize),
        }
    },

    async getBlogsCount(name: string): Promise<number> {
        const filter: Filter<any> = {}

        if (name !== undefined) {
            filter.name = { $regex: name, $options: 'i' }
        }

        return blogsCollection.countDocuments(filter)
    },

    _mapFromDbModelToResponseModel(blogDbModel: WithId<BlogDbModel>): BlogApiResponseModel {
        return {
            id: blogDbModel._id.toString(),
            name: blogDbModel.name,
            description: blogDbModel.description,
            websiteUrl: blogDbModel.websiteUrl,
            isMembership: blogDbModel.isMembership,
            createdAt: blogDbModel.createdAt,
        }
    }
}
