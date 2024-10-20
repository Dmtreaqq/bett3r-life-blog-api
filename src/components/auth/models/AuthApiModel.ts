export type AuthLoginApiRequestModel = {
    loginOrEmail: string
    password: string
}

export type AuthMeInfoResponseModel = {
    email: string
    login: string
    userId: string
}
