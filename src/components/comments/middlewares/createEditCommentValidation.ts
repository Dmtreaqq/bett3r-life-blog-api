import { body } from "express-validator";
import { validationMiddleware } from "../../../common/middlewares/validationMiddleware";

const createContentChain = () =>
  body("content")
    .isString()
    .withMessage("Should be a string")
    .trim()
    .notEmpty()
    .withMessage("Should not be empty")
    .isLength({ min: 20, max: 300 })
    .withMessage("Min - 20, Max - 300 symbols");

export default [createContentChain(), validationMiddleware];
