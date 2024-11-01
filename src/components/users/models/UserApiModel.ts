export type UserApiRequestModel = {
    login: string;
    password: string;
    email: string;
}

export type UserApiResponseModel = {
    id: string
    login: string;
    email: string;
    createdAt: string;
}

export type UsersApiResponseModel = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: UserApiResponseModel[];
}
