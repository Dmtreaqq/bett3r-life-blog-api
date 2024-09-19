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
exports.postsController = void 0;
const express_1 = require("express");
const types_1 = require("../utils/types");
const postsRepository_1 = require("../repositories/postsRepository");
const createEditPostValidationChains_1 = __importDefault(require("../middlewares/validation/createEditPostValidationChains"));
exports.postsController = (0, express_1.Router)();
exports.postsController.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = postsRepository_1.postsRepository.getPosts();
    return res.json(posts);
}));
exports.postsController.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const foundPost = postsRepository_1.postsRepository.getPostById(id);
    if (!foundPost) {
        return res.sendStatus(types_1.HTTP_STATUSES.NOT_FOUND_404);
    }
    return res.json(foundPost);
}));
exports.postsController.post('/', ...createEditPostValidationChains_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const post = postsRepository_1.postsRepository.createPost(body);
    return res.status(types_1.HTTP_STATUSES.CREATED_201).json(post);
}));
exports.postsController.put('/:id', ...createEditPostValidationChains_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foundPost = postsRepository_1.postsRepository.getPostById(req.params.id);
    if (!foundPost) {
        return res.sendStatus(types_1.HTTP_STATUSES.NOT_FOUND_404);
    }
    const updatedPostFromBody = req.body;
    const newPost = Object.assign(Object.assign({}, foundPost), updatedPostFromBody);
    postsRepository_1.postsRepository.updatePostById(newPost);
    return res.sendStatus(types_1.HTTP_STATUSES.NO_CONTENT_204);
}));
exports.postsController.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foundPost = postsRepository_1.postsRepository.getPostById(req.params.id);
    if (!foundPost) {
        return res.sendStatus(types_1.HTTP_STATUSES.NOT_FOUND_404);
    }
    postsRepository_1.postsRepository.deletePostById(foundPost.id);
    return res.sendStatus(types_1.HTTP_STATUSES.NO_CONTENT_204);
}));
