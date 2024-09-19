"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const validationMiddleware_1 = require("./validationMiddleware");
const urlRegex = new RegExp('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$');
const createNameChain = () => (0, express_validator_1.body)('name')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ max: 15 }).withMessage('Max - 15 symbols');
const createDescriptionChain = () => (0, express_validator_1.body)('description')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ max: 500 }).withMessage('Max - 500 symbols');
const createWebsiteUrlChain = () => (0, express_validator_1.body)('websiteUrl')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ max: 100 }).withMessage('Max - 100 symbols')
    .matches(urlRegex).withMessage((value) => `Should follow URL regex with HTTPS://, received ${value}`);
exports.default = [
    createNameChain(),
    createDescriptionChain(),
    createWebsiteUrlChain(),
    validationMiddleware_1.validationMiddleware
];
