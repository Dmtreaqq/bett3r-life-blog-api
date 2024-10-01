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