import { PostApiRequestModel } from "../../posts/models/PostApiModel";

export type BlogApiResponseModel = {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    isMembership: boolean;
    createdAt: string;
}

export type BlogApiRequestModel = {
    name: string;
    description: string;
    websiteUrl: string;
}

export type BlogCreatePostApiRequestModel = Omit<PostApiRequestModel, "blogId">