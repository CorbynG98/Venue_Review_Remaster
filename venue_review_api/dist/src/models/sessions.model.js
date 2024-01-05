'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.verifyVenueAuth =
  exports.removeSession =
  exports.getByToken =
  exports.createSession =
    void 0;
const db_1 = require('../config/db');
const createSession = (values) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'INSERT INTO Session (session_id, token, created_at, expiry, user_id) VALUES (?, ?, ?, ?, ?)',
      values,
      (err) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};
exports.createSession = createSession;
const getByToken = (token) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'SELECT user_id FROM Session WHERE token = ? LIMIT 1',
      token,
      (err, result) => {
        if (err) return reject(err);
        if (result == '' || result == null || result.length == 0)
          return reject(null);
        return resolve(result[0].user_id);
      },
    );
  });
};
exports.getByToken = getByToken;
const removeSession = (token) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'DELETE FROM Session WHERE token = ?',
      token,
      (err) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};
exports.removeSession = removeSession;
const verifyVenueAuth = (user_id, venue_id) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'SELECT venue_id FROM Venue WHERE admin_id = ? AND venue_id = ?',
      [user_id, venue_id],
      (err, result) => {
        if (err) return reject(err);
        if (result == '' || result == null || result.length == 0)
          return reject(null);
        return resolve(true);
      },
    );
  });
};
exports.verifyVenueAuth = verifyVenueAuth;
