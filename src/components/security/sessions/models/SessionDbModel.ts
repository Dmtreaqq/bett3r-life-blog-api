export type SessionDbModel = {
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string;
  issuedAt: number;
  expirationDate: number;
};
