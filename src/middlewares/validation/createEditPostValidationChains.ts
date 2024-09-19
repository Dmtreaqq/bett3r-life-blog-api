import { body } from "express-validator"
import { validationMiddleware } from "./validationMiddleware";
import { blogsRepository } from "../../repositories/blogsRepository";

const createTitleChain = () => body('title')
    .notEmpty().withMessage('Should not be empty')
    .isString().withMessage('Should be a string')
    .isLength({ max: 30 }).withMessage('Max - 30 symbols');

const createDescriptionChain = () => body('shortDescription')
    .notEmpty().withMessage('Should not be empty')
    .isString().withMessage('Should be a string')
    .isLength({ max: 100 }).withMessage('Max - 100 symbols');

const createContentChain = () => body('content')
    .notEmpty().withMessage('Should not be empty')
    .isString().withMessage('Should be a string')
    .isLength({ max: 1000 }).withMessage('Max - 1000 symbols');

const createBlogIdChain = () => body('blogId')
    .notEmpty().withMessage('Should not be empty')
    .isString().withMessage('Should be a string')
    .custom(value => {
        const foundBlog = blogsRepository.getBlogById(value);

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
