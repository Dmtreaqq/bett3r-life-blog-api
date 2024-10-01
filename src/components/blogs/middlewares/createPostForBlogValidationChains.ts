import { body, param } from "express-validator"
import { validationMiddleware } from "../../../middlewares/validationMiddleware";
import { blogsRepository } from "../blogsRepository";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createBlogIdChain = () => param('id')
    .trim()
    .matches(objectIdRegex).withMessage('Blog ID should be an ObjectId type')
    .custom(async value => {
        const foundBlog = await blogsRepository.getBlogById(value);

        if (!foundBlog) {
            throw new Error(`Blog ${value} not found`);
        }

        return true
    })

const createTitleChain = () => body('title')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ max: 30 }).withMessage('Max - 30 symbols');

const createDescriptionChain = () => body('shortDescription')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ max: 100 }).withMessage('Max - 100 symbols');

const createContentChain = () => body('content')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .isLength({ max: 1000 }).withMessage('Max - 1000 symbols');

export default [
    createBlogIdChain(),
    createTitleChain(),
    createDescriptionChain(),
    createContentChain(),
    validationMiddleware
];
