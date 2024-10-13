import { PostApiRequestModel } from "../../posts/models/PostApiModel";
import { BlogDbModel } from "./BlogDbModel";

export type BlogApiResponseModel = {
    id: string;
} & BlogDbModel;

export type BlogsApiResponseModel = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: BlogApiResponseModel[];
}

export type BlogApiRequestModel = {
    name: string;
    description: string;
    websiteUrl: string;
}

export type BlogCreatePostApiRequestModel = Omit<PostApiRequestModel, "blogId">