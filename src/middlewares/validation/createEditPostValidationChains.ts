import { body } from "express-validator"
import { validationMiddleware } from "./validationMiddleware";
import { blogsRepository } from "../../repositories/blogsRepository";

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

const createBlogIdChain = () => body('blogId')
    .isString().withMessage('Should be a string')
    .trim()
    .notEmpty().withMessage('Should not be empty')
    .custom(async value => {
        const foundBlog = await blogsRepository.getBlogById(value);

        if (!foundBlog) {
            throw new Error(`Blog ${value} not found`);
        }

        return true
    })

export default [
    createBlogIdChain(),
    createTitleChain(),
    createDescriptionChain(),
    createContentChain(),

    validationMiddleware
];
