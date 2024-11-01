import { validationMiddleware } from "../../../common/middlewares/validationMiddleware";
import { body } from "express-validator";

const createCodeChain = () =>
  body("code")
    .isString()
    .withMessage("Should be a string")
    .trim()
    .notEmpty()
    .withMessage("Should not be empty")
    .isLength({ max: 50 })
    .withMessage("Max - 50 symbols");

export default [createCodeChain(), validationMiddleware];
