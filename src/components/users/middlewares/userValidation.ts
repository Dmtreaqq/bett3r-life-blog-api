import {validationMiddleware} from "../../../middlewares/validationMiddleware";
import {body} from "express-validator";

/*export type UserApiRequestModel = {
    login: string;
    password: string;
    email: string;
}*/

const loginRegex = new RegExp('^[a-zA-Z0-9_-]*$')
const emailRegex = new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')

const createLoginChain = () => body('login')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ min: 3, max: 10 }).withMessage('Min - 3, Max - 10 symbols')
    .matches(loginRegex).withMessage((value) => `Should follow regex: ${loginRegex}, received ${value}`);

const createPasswordChain = () => body('password')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ min: 6, max: 20 }).withMessage('Min - 6, Max - 20 symbols')

const createEmailChain = () => body('email')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ max: 50 }).withMessage('Max - 50 symbols')
    .matches(emailRegex).withMessage((value) => `Should follow regex: ${emailRegex}, received ${value}`);

export default [
    createLoginChain(),
    createPasswordChain(),
    createEmailChain(),
    validationMiddleware
]
