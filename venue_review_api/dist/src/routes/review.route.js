"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const review_controller_1 = require("../controllers/review.controller");
const authenticate_middleware_1 = __importDefault(require("../util/authenticate.middleware"));
const validateReviewData = [
    (0, express_validator_1.check)('venue_id').notEmpty().withMessage('Venue is required'),
    (0, express_validator_1.check)('review_body').notEmpty().withMessage('Body is required'),
    (0, express_validator_1.check)('cost_rating').notEmpty().withMessage('Cost rating is required'),
    (0, express_validator_1.check)('star_rating').notEmpty().withMessage('Star rating is required'),
    (0, express_validator_1.check)('cost_rating')
        .isFloat({ min: 0, max: 5 })
        .withMessage('Cost rating must be a number between 0 and 5'),
    (0, express_validator_1.check)('star_rating')
        .isFloat({ min: 0, max: 5 })
        .withMessage('Star rating must be a number between 0 and 5'),
];
const user_routes = (app) => {
    app
        .route('/venues/:id/reviews')
        .get(review_controller_1.getReviews)
        .patch([...validateReviewData, authenticate_middleware_1.default], review_controller_1.createReview);
    app.route('/users/:id/reviews').get(authenticate_middleware_1.default, review_controller_1.getUserReviews);
};
exports.default = user_routes;
