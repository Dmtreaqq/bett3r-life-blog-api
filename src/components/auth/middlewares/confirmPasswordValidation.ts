import { body } from "express-validator";
import { validationMiddleware } from "../../../common/middlewares/validationMiddleware";

const createNewPasswordChain = () =>
  body("newPassword")
    .isString()
    .withMessage("Should be a string")
    .trim()
    .notEmpty()
    .withMessage("Should not be empty")
    .isLength({ min: 6, max: 20 })
    .withMessage("Min - 6 symbols, Max - 20");

const createRecoveryCodeChain = () =>
  body("recoveryCode")
    .isString()
    .withMessage("Should be a string")
    .trim()
    .notEmpty()
    .withMessage("Should not be empty");

export default [createNewPasswordChain(), createRecoveryCodeChain(), validationMiddleware];
