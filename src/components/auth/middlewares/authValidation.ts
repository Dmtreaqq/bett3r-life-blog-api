import {validationMiddleware} from "../../../middlewares/validationMiddleware";
import { body } from 'express-validator'

const createLoginOrEmailChain = () => body('loginOrEmail')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ max: 50 }).withMessage('Max - 50 symbols');

const createPasswordChain = () => body('password')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ max: 50 }).withMessage('Max - 50 symbols');

export default [
    createLoginOrEmailChain(),
    createPasswordChain(),
    validationMiddleware
]
