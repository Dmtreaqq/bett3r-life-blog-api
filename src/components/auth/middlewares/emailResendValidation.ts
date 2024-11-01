import { validationMiddleware } from "../../../common/middlewares/validationMiddleware";
import { body } from "express-validator";

const emailRegex = new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");

const createEmailChain = () =>
  body("email")
    .isString()
    .withMessage("Should be a string")
    .trim()
    .notEmpty()
    .withMessage("Should not be empty")
    .isLength({ max: 50 })
    .withMessage("Max - 50 symbols")
    .matches(emailRegex)
    .withMessage((value) => `Should follow regex: ${emailRegex}, received ${value}`);

export default [createEmailChain(), validationMiddleware];
