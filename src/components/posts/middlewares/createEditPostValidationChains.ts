import { body } from "express-validator"
import { validationMiddleware } from "../../../middlewares/validationMiddleware";
import { blogsRepository } from "../../blogs/repositories/blogsRepository";
import {blogsQueryRepository} from "../../blogs/repositories/blogsQueryRepository";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

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
    .matches(objectIdRegex).withMessage('Blog ID should be an ObjectId type')
    .custom(async value => {
        const foundBlog = await blogsQueryRepository.getBlogById(value);

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
