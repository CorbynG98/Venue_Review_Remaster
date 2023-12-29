"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhoto = exports.updateUser = exports.removePhoto = exports.getUserByUsername = exports.getUserByEmail = exports.getPhoto = exports.createUser = void 0;
const db_1 = require("../config/db");
const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        (0, db_1.getPool)().query('SELECT user_id, password FROM User WHERE email = ? LIMIT 1', email, (err, result) => {
            if (err)
                return reject(err);
            if (result == '' || result == null || result.length == 0)
                return resolve(null);
            resolve(result[0]);
        });
    });
};
exports.getUserByEmail = getUserByEmail;
const getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        (0, db_1.getPool)().query('SELECT user_id, password FROM User WHERE username = ? LIMIT 1', username, (err, result) => {
            if (err)
                return reject(err);
            if (result == '' || result == null || result.length == 0)
                return resolve(null);
            resolve(result[0]);
        });
    });
};
exports.getUserByUsername = getUserByUsername;
const createUser = (values) => {
    return new Promise((resolve, reject) => {
        (0, db_1.getPool)().query('INSERT INTO User (user_id, username, email, given_name, family_name, password) VALUES (?, ?, ?, ?, ?, ?)', values, (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
exports.createUser = createUser;
const updateUser = (values) => {
    return new Promise((resolve, reject) => {
        (0, db_1.getPool)().query('UPDATE User SET ? VALUES ?', values, (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
exports.updateUser = updateUser;
const getPhoto = (user_id) => {
    return new Promise((resolve, reject) => {
        (0, db_1.getPool)().query('SELECT profile_photo_filename FROM User WHERE user_id = ?', user_id, (err, result) => {
            if (err)
                return reject(err);
            resolve(result);
        });
    });
};
exports.getPhoto = getPhoto;
const uploadPhoto = (values) => {
    return new Promise((resolve, reject) => {
        (0, db_1.getPool)().query('UPDATE User SET profile_photo_filename = ? WHERE user_id = ?', values, (err) => {
            if (err)
                return reject(err);
            return resolve();
        });
    });
};
exports.uploadPhoto = uploadPhoto;
const removePhoto = (user_id) => {
    return new Promise((resolve, reject) => {
        (0, db_1.getPool)().query('UPDATE User SET profile_photo_filename = NULL WHERE user_id = ?', user_id, (err) => {
            if (err)
                return reject(err);
            return resolve();
        });
    });
};
exports.removePhoto = removePhoto;
