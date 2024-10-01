import { param } from "express-validator";
import { validationMiddleware } from "../../../middlewares/validationMiddleware";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createIdChain = () => param('id')
    .trim()
    .matches(objectIdRegex).withMessage('Post ID should be an ObjectId type');

export default [
    createIdChain(),
    validationMiddleware
]