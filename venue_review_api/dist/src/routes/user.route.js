"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const user_controller_1 = require("../controllers/user.controller");
const user_authenticate_middleware_1 = __importDefault(require("../util/user_authenticate.middleware"));
const validateUserData = [
    (0, express_validator_1.check)('username').notEmpty().withMessage('Username is required'),
    (0, express_validator_1.check)('email').notEmpty().withMessage('Email is required'),
    (0, express_validator_1.check)('givenName').notEmpty().withMessage('Given name is required'),
    (0, express_validator_1.check)('familyName').notEmpty().withMessage('Family name is required'),
];
const user_routes = (app) => {
    app
        .route('/users/:id')
        .patch([...validateUserData, user_authenticate_middleware_1.default], user_controller_1.updateUser);
    app
        .route('/users/:id/photo')
        .get(user_authenticate_middleware_1.default, user_controller_1.getPhoto)
        .put(user_authenticate_middleware_1.default, user_controller_1.uploadPhoto)
        .delete(user_authenticate_middleware_1.default, user_controller_1.removePhoto);
};
exports.default = user_routes;
