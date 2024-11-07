import mongoose from "mongoose";
import { BlogDbModel } from "../../../components/blogs/models/BlogDbModel";

const urlRegex = new RegExp("^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$");

// TODO как возвращать на клиент данньіе ошибки ?? или просто логать

const blogSchema = new mongoose.Schema<BlogDbModel>({
  name: { type: String, maxlength: 15, required: true },
  description: { type: String, maxlength: 500, required: true },
  isMembership: { type: Boolean, required: true },
  websiteUrl: { type: String, maxlength: 100, match: urlRegex, required: true },
  createdAt: { type: String, required: true },
});

export const BlogModelClass = mongoose.model("blogs", blogSchema);
