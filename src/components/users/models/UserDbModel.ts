export type UserDbModel = {
  login: string;
  email: string;
  password: string;
  createdAt: string;
  isConfirmed: boolean;
  confirmationCode: string;
  expirationDate: string;
};
