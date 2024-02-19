"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyVenueAuth = exports.removeSession = exports.getByToken = exports.createSession = void 0;
const db_1 = require("../config/db");
const createSession = async (values) => {
    try {
        await (0, db_1.poolQuery)('INSERT INTO Session (session_id, token, created_at, expiry, user_id) VALUES (?, ?, ?, ?, ?)', values);
        return;
    }
    catch (err) {
        throw err;
    }
};
exports.createSession = createSession;
const getByToken = async (token) => {
    try {
        let result = (await (0, db_1.poolQuery)('SELECT user_id FROM Session WHERE token = ? LIMIT 1', [token]));
        if (result == null || result.length != 1)
            throw new Error('Invalid token.');
        return result[0].user_id;
    }
    catch (err) {
        throw new Error('Invalid token.');
    }
};
exports.getByToken = getByToken;
const removeSession = async (token) => {
    try {
        await (0, db_1.poolQuery)('DELETE FROM Session WHERE token = ?', [token]);
        return;
    }
    catch (err) {
        throw err;
    }
};
exports.removeSession = removeSession;
const verifyVenueAuth = async (user_id, venue_id) => {
    try {
        let result = (await (0, db_1.poolQuery)('SELECT venue_id FROM Venue WHERE admin_id = ? AND venue_id = ?', [user_id, venue_id]));
        return result.length == 1;
    }
    catch (err) {
        throw err;
    }
};
exports.verifyVenueAuth = verifyVenueAuth;
