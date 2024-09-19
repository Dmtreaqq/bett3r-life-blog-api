"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogsController = void 0;
const express_1 = require("express");
const types_1 = require("../utils/types");
const blogsRepository_1 = require("../repositories/blogsRepository");
const createEditBlogValidationChains_1 = __importDefault(require("../middlewares/validation/createEditBlogValidationChains"));
exports.blogsController = (0, express_1.Router)();
exports.blogsController.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogs = blogsRepository_1.blogsRepository.getBlogs();
    return res.json(blogs);
}));
exports.blogsController.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const foundPost = blogsRepository_1.blogsRepository.getBlogById(id);
    if (!foundPost) {
        return res.sendStatus(types_1.HTTP_STATUSES.NOT_FOUND_404);
    }
    return res.json(foundPost);
}));
exports.blogsController.post('/', ...createEditBlogValidationChains_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const post = blogsRepository_1.blogsRepository.createBlog(body);
    return res.status(201).json(post);
}));
exports.blogsController.put('/:id', ...createEditBlogValidationChains_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foundPost = blogsRepository_1.blogsRepository.getBlogById(req.params.id);
    if (!foundPost) {
        return res.sendStatus(types_1.HTTP_STATUSES.NOT_FOUND_404);
    }
    const updatedPostFromBody = req.body;
    const newPost = Object.assign(Object.assign({}, foundPost), updatedPostFromBody);
    blogsRepository_1.blogsRepository.updateBlogById(newPost);
    return res.sendStatus(types_1.HTTP_STATUSES.NO_CONTENT_204);
}));
exports.blogsController.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foundPost = blogsRepository_1.blogsRepository.getBlogById(req.params.id);
    if (!foundPost) {
        return res.sendStatus(types_1.HTTP_STATUSES.NOT_FOUND_404);
    }
    blogsRepository_1.blogsRepository.deleteBlogById(foundPost.id);
    return res.sendStatus(types_1.HTTP_STATUSES.NO_CONTENT_204);
}));
