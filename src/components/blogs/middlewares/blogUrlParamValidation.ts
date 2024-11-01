import { param } from "express-validator";
import { validationMiddleware } from "../../../common/middlewares/validationMiddleware";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createIdChain = () =>
  param("id").trim().matches(objectIdRegex).withMessage("Blog ID should be an ObjectId type");

export default [createIdChain(), validationMiddleware];
