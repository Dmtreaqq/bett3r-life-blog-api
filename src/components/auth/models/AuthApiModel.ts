export type AuthLoginApiRequestModel = {
  loginOrEmail: string;
  password: string;
};

export type AuthRegisterApiRequestModel = {
  login: string;
  password: string;
  email: string;
};

export type AuthMeInfoResponseModel = {
  email: string;
  login: string;
  userId: string;
};
