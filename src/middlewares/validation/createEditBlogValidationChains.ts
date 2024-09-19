import { body } from "express-validator"
import { validationMiddleware } from "./validationMiddleware";

const urlRegex = new RegExp('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$');

const createNameChain = () => body('name')
    .notEmpty().withMessage('Should not be empty')
    .isString().withMessage('Should be a string')
    .isLength({ max: 15 }).withMessage('Max - 15 symbols');

const createDescriptionChain = () => body('description')
    .notEmpty().withMessage('Should not be empty')
    .isString().withMessage('Should be a string')
    .isLength({ max: 500 }).withMessage('Max - 500 symbols');

const createWebsiteUrlChain = () => body('websiteUrl')
    .notEmpty().withMessage('Should not be empty')
    .isString().withMessage('Should be a string')
    .isLength({ max: 100 }).withMessage('Max - 100 symbols')
    .matches(urlRegex).withMessage((value) => `Should follow URL regex with HTTPS://, received ${value}`);

export default [
    createNameChain(),
    createDescriptionChain(),
    createWebsiteUrlChain(),
    validationMiddleware
];
