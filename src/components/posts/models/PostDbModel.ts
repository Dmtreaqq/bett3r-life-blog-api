import { ObjectId } from "mongodb";

export type PostDbModel = {
    _id: ObjectId
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
}

// TODO with blogs same