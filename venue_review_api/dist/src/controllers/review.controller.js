"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviews = exports.createReview = void 0;
const crypto_1 = __importDefault(require("crypto"));
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const reviews_model_1 = require("../models/reviews.model");
const sessions_model_1 = require("../models/sessions.model");
const getReviews = async (req, res) => {
    (0, reviews_model_1.getVenueReviews)(req.params.id)
        .then((result) => {
        res.status(200).json(result);
    })
        .catch((err) => {
        res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};
exports.getReviews = getReviews;
const createReview = async (req, res) => {
    const validation = (0, express_validator_1.validationResult)(req);
    if (!validation.isEmpty()) {
        return res.status(400).json({ errors: validation.array() });
    }
    // Get the user_id from their token
    let token = req.header('Authorization')?.toString() ?? '';
    let hashedToken = crypto_1.default.createHash('sha512').update(token).digest('hex');
    let user_id = (await (0, sessions_model_1.getByToken)(hashedToken));
    // Check if this user can write a review
    try {
        let review_check = await (0, reviews_model_1.checkReviewer)(user_id, req.params.id);
        if (!review_check) {
            return res.status(403).json({
                status: 403,
                message: 'You cannot write a review for this venue.',
            });
        }
    }
    catch (err) {
        return res.status(500).json({ status: 500, message: err });
    }
    let values = [
        (0, uuid_1.v4)().replace(/-/g, ''),
        req.params.id,
        req.body.review_body,
        req.body.star_rating,
        req.body.cost_rating,
        new Date(),
        user_id,
    ];
    (0, reviews_model_1.createReview)(values)
        .then(() => {
        return res.status(201).json({ status: 201, message: 'Created' });
    })
        .catch((err) => {
        return res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};
exports.createReview = createReview;
