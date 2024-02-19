"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhoto = exports.updateUser = exports.removePhoto = void 0;
const crypto_1 = __importDefault(require("crypto"));
const express_validator_1 = require("express-validator");
const sessions_model_1 = require("../models/sessions.model");
const users_model_1 = require("../models/users.model");
const google_cloud_storage_helper_1 = require("../util/google_cloud_storage.helper");
const userDPBucket = 'venue-review-user-dp';
const updateUser = async (req, res) => {
    const validation = (0, express_validator_1.validationResult)(req);
    if (!validation.isEmpty()) {
        return res.status(400).json({ errors: validation.array() });
    }
    let token = req.header('Authorization')?.toString() ?? '';
    let hashedToken = crypto_1.default.createHash('sha512').update(token).digest('hex');
    let user_id = (await (0, sessions_model_1.getByToken)(hashedToken));
    let user = await (0, users_model_1.getUsernameEmailById)(user_id);
    // Check email, if different to one currently used.
    if (user != null && user.email != req.body.email) {
        // Get user by email from database, to see if there is one already. Fail request if so.
        let userByEmail = await (0, users_model_1.getUserByEmail)(req.body.email);
        if (userByEmail != null) {
            res.status(400).json({ status: 400, message: 'Email already in use.' });
            return;
        }
    }
    // Check username, if different to one currently used.
    if (user != null && user.email != req.body.email) {
        // Get user by email from database, to see if there is one already. Fail request if so.
        let userByUsername = await (0, users_model_1.getUserByUsername)(req.body.username);
        if (userByUsername != null) {
            res
                .status(400)
                .json({ status: 400, message: 'Username already in use.' });
            return;
        }
    }
    let values = [
        req.body.username,
        req.body.email,
        req.body.given_name,
        req.body.family_name,
        user_id,
    ];
    (0, users_model_1.updateUser)(values)
        .then(() => {
        res.status(200).json({ status: 200, message: 'OK' });
    })
        .catch((err) => {
        if (err.code == 'ER_DUP_ENTRY') {
            res.status(400).json({
                status: 400,
                message: 'Username or email is not valid, or already in use.',
            });
            return;
        }
        res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};
exports.updateUser = updateUser;
const uploadPhoto = async (req, res) => {
    let token = req.header('Authorization')?.toString() ?? '';
    let hashedToken = crypto_1.default.createHash('sha512').update(token).digest('hex');
    let user_id = (await (0, sessions_model_1.getByToken)(hashedToken));
    if (req.file == null)
        return res.status(400).json({ status: 400, message: 'No file provided.' });
    let image = req.file.buffer;
    let imageExt = req.file.mimetype.split('/')[1];
    let fileName = `${user_id}.${imageExt}`;
    try {
        (0, google_cloud_storage_helper_1.uploadFile)(fileName, image, userDPBucket).then((result) => {
            let values = [result, user_id];
            (0, users_model_1.uploadPhoto)(values)
                .then(() => {
                res.status(201).json({ status: 201, message: result });
            })
                .catch((err) => {
                res.status(500).json({ status: 500, message: err?.code ?? err });
            });
        });
    }
    catch (err) {
        res.status(500).json({ status: 500, message: err });
    }
};
exports.uploadPhoto = uploadPhoto;
const removePhoto = async (req, res) => {
    let token = req.header('Authorization')?.toString() ?? '';
    let hashedToken = crypto_1.default.createHash('sha512').update(token).digest('hex');
    let user_id = (await (0, sessions_model_1.getByToken)(hashedToken));
    // Get the users current dp from database
    (0, users_model_1.getPhoto)(user_id)
        .then((result) => {
        // If the user doesn't have a dp, we don't need to do anything.
        if (result == null) {
            return res
                .status(200)
                .json({ status: 200, message: 'No profile photo to remove.' });
        }
        // Get extension from the current DP.
        let resultSplit = result.split('/');
        let fileName = resultSplit[resultSplit.length - 1]?.toLowerCase();
        // If the user does have a dp, we need to remove it from storage and update the database.
        (0, google_cloud_storage_helper_1.removeFile)(fileName, userDPBucket).then(() => {
            (0, users_model_1.removePhoto)(user_id)
                .then(() => {
                res.status(204).json({ status: 204, message: 'No Content.' });
            })
                .catch((err) => {
                res.status(500).json({ status: 500, message: err?.code ?? err });
            });
        });
    })
        .catch((err) => {
        res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};
exports.removePhoto = removePhoto;
