"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const sessions_model_1 = require("../models/sessions.model");
// This will only be used on endpoints where we are validating the user is the admin of the venue being worked with.
// Because of that, we can assume the id param will always be the venue_id and should be present. We still double check that it is present though.
const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    const venue_id = req.params.id;
    // Validate venue_id was provided
    if (venue_id == null || venue_id.trim().length == 0) {
        return res.status(400).json('Invalid venue_id. Please try again.');
    }
    // Validate token
    if (!token) {
        return res.status(401).json('Access denied. No token provided.');
    }
    let hashedToked = crypto_1.default.createHash('sha512').update(token).digest('hex');
    (0, sessions_model_1.getByToken)(hashedToked)
        .then((result) => {
        (0, sessions_model_1.verifyVenueAuth)(result, venue_id)
            .then((result) => {
            if (result)
                next();
            else
                return res
                    .status(403)
                    .json('Access denied. Invalid venue or permission to work with it.');
        })
            .catch(() => {
            return res
                .status(403)
                .json('Access denied. Invalid venue or permission to work with it.');
        });
    })
        .catch(() => {
        return res.status(403).json('Access denied. Invalid token.');
    });
};
exports.default = authenticate;
