"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const validationMiddleware_1 = require("./validationMiddleware");
const blogsRepository_1 = require("../../repositories/blogsRepository");
const createTitleChain = () => (0, express_validator_1.body)('title')
    .notEmpty().withMessage('Should not be empty')
    .isString().withMessage('Should be a string')
    .isLength({ max: 30 }).withMessage('Max - 30 symbols');
const createDescriptionChain = () => (0, express_validator_1.body)('shortDescription')
    .notEmpty().withMessage('Should not be empty')
    .isString().withMessage('Should be a string')
    .isLength({ max: 100 }).withMessage('Max - 100 symbols');
const createContentChain = () => (0, express_validator_1.body)('content')
    .notEmpty().withMessage('Should not be empty')
    .isString().withMessage('Should be a string')
    .isLength({ max: 1000 }).withMessage('Max - 1000 symbols');
const createBlogIdChain = () => (0, express_validator_1.body)('blogId')
    .notEmpty().withMessage('Should not be empty')
    .isString().withMessage('Should be a string')
    .custom(value => {
    const foundBlog = blogsRepository_1.blogsRepository.getBlogById(value);
    if (!foundBlog) {
        throw new Error(`Blog ${value} not found`);
    }
    return true;
});
exports.default = [
    createBlogIdChain(),
    createTitleChain(),
    createDescriptionChain(),
    createContentChain(),
    validationMiddleware_1.validationMiddleware
];
