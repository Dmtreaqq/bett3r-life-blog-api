import mongoose from "mongoose";
import { ApiLogDbModel } from "../../../components/security/apiLogs/models/ApiLogDbModel";

const apiLogSchema = new mongoose.Schema<ApiLogDbModel>({
  ip: { type: String, required: true },
  url: { type: String, required: true },
  date: { type: Number, required: true },
});

export const ApiLogClassModel = mongoose.model("api-logs", apiLogSchema);
