"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signout = exports.login = exports.create = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const sessions_model_1 = require("../models/sessions.model");
const users_model_1 = require("../models/users.model");
function testEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
const login = async (req, res) => {
    const validation = (0, express_validator_1.validationResult)(req);
    if (!validation.isEmpty()) {
        return res.status(400).json({ errors: validation.array() });
    }
    let isEmailLogin = testEmail(req.body.username);
    try {
        // Get user data by email or username, depending on what the user entered for login
        let userData = isEmailLogin
            ? await (0, users_model_1.getUserByEmail)(req.body.username)
            : await (0, users_model_1.getUserByUsername)(req.body.username);
        if (userData == null || userData.user_id == null) {
            res
                .status(401)
                .json({ status: 401, message: 'Invalid username or password' });
            return;
        }
        bcrypt_1.default.compare(req.body.password, userData.password).then((result) => {
            if (!result) {
                res
                    .status(401)
                    .json({ status: 401, message: 'Invalid username or password' });
                return;
            }
            let token = crypto_1.default
                .createHash('sha512')
                .update((0, uuid_1.v4)().replace(/-/g, ''))
                .digest('hex');
            let hashedToked = crypto_1.default.createHash('sha512').update(token).digest('hex');
            let session_values = [
                (0, uuid_1.v4)().replace(/-/g, ''),
                hashedToked,
                new Date(),
                null,
                userData?.user_id ?? null,
            ];
            (0, sessions_model_1.createSession)(session_values).then(() => {
                res.status(200).json({ username: req.body.username, token: token, fullName: userData?.given_name + ' ' + userData?.family_name, profile_photo_filename: userData?.profile_photo_filename });
            });
        });
    }
    catch (err) {
        res.status(500).json({ status: 500, message: err });
    }
};
exports.login = login;
const create = async (req, res) => {
    const validation = (0, express_validator_1.validationResult)(req);
    if (!validation.isEmpty()) {
        return res.status(400).json({ errors: validation.array() });
    }
    let user_id = (0, uuid_1.v4)().replace(/-/g, '');
    let user_values = [
        user_id,
        req.body.username,
        req.body.email,
        req.body.givenName,
        req.body.familyName,
    ];
    bcrypt_1.default
        .hash(req.body.password, 13)
        .then((result) => {
        user_values.push(result);
        (0, users_model_1.createUser)(user_values)
            .then(() => {
            // Do login here now too, I guess?
            let token = crypto_1.default
                .createHash('sha512')
                .update((0, uuid_1.v4)().replace(/-/g, ''))
                .digest('hex');
            let hashedToked = crypto_1.default
                .createHash('sha512')
                .update(token)
                .digest('hex');
            let session_values = [
                (0, uuid_1.v4)().replace(/-/g, ''),
                hashedToked,
                new Date(),
                null,
                user_id,
            ];
            (0, sessions_model_1.createSession)(session_values).then(() => {
                res.status(200).json({ username: req.body.username, token: token, fullName: req.body.givenName + ' ' + req.body.familyName });
            });
        })
            .catch((err) => {
            if (err.code == 'ER_DUP_ENTRY') {
                return res
                    .status(400)
                    .json({ status: 400, message: 'User already exists' });
            }
            res.status(500).json({ status: 500, message: err?.code ?? err });
        });
    })
        .catch((err) => {
        res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};
exports.create = create;
const signout = async (req, res) => {
    let token = req.header('Authorization');
    // Technically shouldn't be possible, but typescript doesn't know I have auth middleware to handle this case.
    // Only here to get rid of typescript warnings
    if (token == null)
        return res.status(401).json({ status: 401, message: 'No token provided' });
    (0, sessions_model_1.removeSession)(token)
        .then(() => {
        res.status(204).json();
    })
        .catch((err) => {
        res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};
exports.signout = signout;
