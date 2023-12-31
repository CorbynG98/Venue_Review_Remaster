'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.setPrimaryPhoto =
  exports.removeVenuePhoto =
  exports.randomNewPrimary =
  exports.ensureOnlyOnePrimary =
  exports.createVenuePhoto =
    void 0;
const db_1 = require('../config/db');
const createVenuePhoto = (values) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) VALUES (?, ?, ?, ?)',
      values,
      (err) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};
exports.createVenuePhoto = createVenuePhoto;
const ensureOnlyOnePrimary = (values) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = ? AND photo_filename != ?',
      values,
      (err) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};
exports.ensureOnlyOnePrimary = ensureOnlyOnePrimary;
const setPrimaryPhoto = (values) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? AND photo_filename = ?',
      values,
      (err) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};
exports.setPrimaryPhoto = setPrimaryPhoto;
const randomNewPrimary = (venue_id) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'SELECT venue_id, photo_filename FROM VenuePhoto WHERE venue_id = ? LIMIT 1',
      venue_id,
      (err, rows) => {
        if (err) return reject(err);
        if (rows == '' || rows == null || rows.length == 0) resolve();
        (0, db_1.getPool)().query(
          'UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? AND photo_filename = ?',
          [[rows[0].venue_id], [rows[0].photo_filename]],
          (err, result) => {
            if (err) return reject(err);
            resolve();
          },
        );
      },
    );
  });
};
exports.randomNewPrimary = randomNewPrimary;
const removeVenuePhoto = (values) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'SELECT is_primary FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?',
      values,
      (err, rows) => {
        if (err) return reject(err);
        if (rows == '' || rows == null || rows.length == 0) resolve(null);
        (0, db_1.getPool)().query(
          'DELETE FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?',
          values,
          (err) => {
            if (err) return reject(err);
            resolve(rows[0].is_primary == '1');
          },
        );
      },
    );
  });
};
exports.removeVenuePhoto = removeVenuePhoto;
