import mongoose from "mongoose";
import { SessionDbModel } from "../../../components/security/sessions/models/SessionDbModel";

const sessionSchema = new mongoose.Schema<SessionDbModel>({
  userId: { type: String, required: true },
  deviceId: { type: String, required: true },
  ip: { type: String, required: true },
  deviceName: { type: String, required: true },
  issuedAt: { type: Number, required: true },
  expirationDate: { type: Number, required: true },
});

export const SessionModelClass = mongoose.model("sessions", sessionSchema);
