"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const sessions_model_1 = require("../models/sessions.model");
const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    // Validate token
    if (!token) {
        return res.status(401).json('Access denied. No token provided.');
    }
    let hashedToked = crypto_1.default.createHash('sha512').update(token).digest('hex');
    (0, sessions_model_1.getByToken)(hashedToked)
        .then(() => {
        next();
    })
        .catch(() => {
        return res.status(403).json('Access denied. Invalid token.');
    });
};
exports.default = authenticate;
