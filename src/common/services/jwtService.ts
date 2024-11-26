import jwt, { JwtPayload } from "jsonwebtoken";
import { CONFIG } from "../utils/config";

const secret = CONFIG.JWT_SECRET;

export class JwtAuthService {
  createAccessToken(user: { id: string }): string {
    const token = jwt.sign(user, String(secret), {
      expiresIn: "7m",
    });

    return token;
  }

  createRefreshToken(user: { id: string; deviceId: string; versionId: string }): string {
    const token = jwt.sign(user, String(secret), {
      expiresIn: "30m",
    });

    return token;
  }

  verifyToken(token: string): string | JwtPayload {
    const result = jwt.verify(token, String(secret));

    return result;
  }

  decodeToken(token: string): JwtPayload {
    const decoded = jwt.decode(token, { json: true });

    if (!decoded) {
      throw new Error("Something wrong while decoding token");
    }

    return decoded;
  }
}
