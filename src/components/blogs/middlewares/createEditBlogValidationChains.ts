import { body } from "express-validator"
import { validationMiddleware } from "../../../common/middlewares/validationMiddleware";

const urlRegex = new RegExp('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$');

const createNameChain = () => body('name')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ max: 15 }).withMessage('Max - 15 symbols');

const createDescriptionChain = () => body('description')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ max: 500 }).withMessage('Max - 500 symbols');

const createWebsiteUrlChain = () => body('websiteUrl')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ max: 100 }).withMessage('Max - 100 symbols')
    .matches(urlRegex).withMessage((value) => `Should follow URL regex with HTTPS://, received ${value}`);

export default [
    createNameChain(),
    createDescriptionChain(),
    createWebsiteUrlChain(),
    validationMiddleware
];
