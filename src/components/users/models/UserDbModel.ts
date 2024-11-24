export class UserDbModel {
  constructor(
    public login: string,
    public email: string,
    public password: string,
    public createdAt: string,
    public isConfirmed: boolean,
    public confirmationCode: string,
    public recoveryCode: string,
    public recoveryCodeExpirationDate: string,
    public expirationDate: string,
  ) {}
}
