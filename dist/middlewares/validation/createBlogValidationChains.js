"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const validationMiddleware_1 = require("./validationMiddleware");
const urlRegex = new RegExp('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$');
const createNameChain = () => (0, express_validator_1.body)('name')
    .notEmpty().withMessage('Should not be empty').bail()
    .isString().withMessage('Should be a string').bail()
    .isLength({ max: 15 }).withMessage('Max - 15 symbols');
const createDescriptionChain = () => (0, express_validator_1.body)('description')
    .notEmpty().withMessage('Should not be empty').bail()
    .isString().withMessage('Should be a string').bail()
    .isLength({ max: 500 }).withMessage('Max - 500 symbols');
const createWebsiteUrlChain = () => (0, express_validator_1.body)('websiteUrl')
    .notEmpty().withMessage('Should not be empty').bail()
    .isString().withMessage('Should be a string').bail()
    .isLength({ max: 100 }).withMessage('Max - 100 symbols').bail()
    .matches(urlRegex).withMessage('Should follow URL regex with HTTPS://');
exports.default = [
    createNameChain(),
    createDescriptionChain(),
    createWebsiteUrlChain(),
    validationMiddleware_1.validationMiddleware
];
// export const createQueryTitleChain = () => query('title').optional().isAlpha().withMessage('Can\'t be a number')
//
// export const createQueryPaginationChain = () => query(['page', 'pageSize']).optional().isNumeric().withMessage('Can\'t be a string');
