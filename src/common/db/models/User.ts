import mongoose from "mongoose";
import { UserDbModel } from "../../../components/users/models/UserDbModel";

const emailRegex = new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
const loginRegex = new RegExp("^[a-zA-Z0-9_-]*$");

const userSchema = new mongoose.Schema<UserDbModel>({
  email: { type: String, match: emailRegex, maxlength: 50, required: true },
  login: { type: String, match: loginRegex, minlength: 3, maxlength: 10, required: true },
  password: { type: String, required: true },
  isConfirmed: { type: Boolean, default: true },
  confirmationCode: { type: String, default: "0" },
  expirationDate: { type: String, default: new Date().toISOString() },
  createdAt: { type: String, required: true },
});

export const UserModelClass = mongoose.model("users", userSchema);
