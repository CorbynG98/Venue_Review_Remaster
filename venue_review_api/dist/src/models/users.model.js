"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhoto = exports.updateUser = exports.removePhoto = exports.getUsernameEmailById = exports.getUserByUsername = exports.getUserByEmail = exports.getPhoto = exports.getFullUserById = exports.createUser = void 0;
const db_1 = require("../config/db");
const getUsernameEmailById = async (user_id) => {
    try {
        const result = (await (0, db_1.poolQuery)('SELECT username, email FROM User WHERE user_id = ?', [user_id]));
        if (result == null || result.length == 0) {
            return null;
        }
        return result[0];
    }
    catch (err) {
        throw err;
    }
};
exports.getUsernameEmailById = getUsernameEmailById;
const getFullUserById = async (user_id) => {
    try {
        const result = (await (0, db_1.poolQuery)('SELECT username, given_name, family_name, email, profile_photo_filename FROM User WHERE user_id = ?', [user_id]));
        if (result == null || result.length == 0) {
            return null;
        }
        return result[0];
    }
    catch (err) {
        throw err;
    }
};
exports.getFullUserById = getFullUserById;
const getUserByEmail = async (email) => {
    try {
        const result = (await (0, db_1.poolQuery)('SELECT user_id, password, given_name, family_name, profile_photo_filename FROM User WHERE email = ? LIMIT 1', [email]));
        if (result == null || result.length == 0) {
            return null;
        }
        return result[0];
    }
    catch (err) {
        throw err;
    }
};
exports.getUserByEmail = getUserByEmail;
const getUserByUsername = async (username) => {
    try {
        const result = (await (0, db_1.poolQuery)('SELECT user_id, password, given_name, family_name, profile_photo_filename FROM User WHERE username = ? LIMIT 1', [username]));
        if (result == null || result.length == 0) {
            return null;
        }
        return result[0];
    }
    catch (err) {
        throw err;
    }
};
exports.getUserByUsername = getUserByUsername;
const createUser = async (values) => {
    try {
        await (0, db_1.poolQuery)('INSERT INTO User (user_id, username, email, given_name, family_name, password) VALUES (?, ?, ?, ?, ?, ?)', values);
        return;
    }
    catch (err) {
        throw err;
    }
};
exports.createUser = createUser;
const updateUser = async (values) => {
    try {
        await (0, db_1.poolQuery)(`
      UPDATE User SET
        username = ?,
        email = ?,
        given_name = ?,
        family_name = ?
      WHERE user_id = ?`, values);
        return;
    }
    catch (err) {
        throw err;
    }
};
exports.updateUser = updateUser;
const getPhoto = async (user_id) => {
    try {
        let result = (await (0, db_1.poolQuery)('SELECT profile_photo_filename FROM User WHERE user_id = ?', [user_id]));
        return result[0].profile_photo_filename;
    }
    catch (err) {
        throw err;
    }
};
exports.getPhoto = getPhoto;
const uploadPhoto = async (values) => {
    try {
        await (0, db_1.poolQuery)('UPDATE User SET profile_photo_filename = ? WHERE user_id = ?', values);
        return;
    }
    catch (err) {
        throw err;
    }
};
exports.uploadPhoto = uploadPhoto;
const removePhoto = async (user_id) => {
    try {
        await (0, db_1.poolQuery)('UPDATE User SET profile_photo_filename = NULL WHERE user_id = ?', [user_id]);
        return;
    }
    catch (err) {
        throw err;
    }
};
exports.removePhoto = removePhoto;
