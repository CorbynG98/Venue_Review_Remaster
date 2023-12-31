'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getCategories = void 0;
const db_1 = require('../config/db');
const getCategories = () => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'SELECT category_id, category_name, category_description FROM VenueCategory',
      null,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};
exports.getCategories = getCategories;
