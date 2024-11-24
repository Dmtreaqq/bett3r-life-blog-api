export class SessionDbModel {
  constructor(
    public userId: string,
    public deviceId: string,
    public deviceName: string,
    public ip: string,
    public issuedAt: number,
    public expirationDate: number,
  ) {}
}
