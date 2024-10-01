export type PostApiResponseModel = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
}

export type PostApiRequestModel = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
}