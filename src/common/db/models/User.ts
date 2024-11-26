import mongoose from "mongoose";
import {
  CommentReaction,
  ReactionEnum,
  UserDbModel,
} from "../../../components/users/models/UserDbModel";

const emailRegex = new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
const loginRegex = new RegExp("^[a-zA-Z0-9_-]*$");

const commentReactionSchema = new mongoose.Schema<CommentReaction>({
  commentId: { type: String, required: true },
  status: { type: String, enum: ReactionEnum },
});

const userSchema = new mongoose.Schema<UserDbModel>({
  email: { type: String, match: emailRegex, maxlength: 50, required: true },
  login: { type: String, match: loginRegex, minlength: 3, maxlength: 10, required: true },
  password: { type: String, required: true },
  isConfirmed: { type: Boolean, default: true },
  confirmationCode: { type: String, default: "0" },
  recoveryCode: { type: String, default: "0" },
  recoveryCodeExpirationDate: { type: String, default: new Date().toISOString() },
  expirationDate: { type: String, default: new Date().toISOString() },
  createdAt: { type: String, required: true },
  commentReactions: { type: [commentReactionSchema] },
});

export const UserModelClass = mongoose.model("users", userSchema);
