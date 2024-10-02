import { BlogApiResponseModel } from "../../blogs/models/BlogApiModel";

export type PostApiResponseModel = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
}

export type PostsApiResponseModel = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: PostApiResponseModel[];
}

export type PostApiRequestModel = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
}