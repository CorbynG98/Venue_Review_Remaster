'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getCategories = exports.doesCategoryExist = void 0;
const db_1 = require('../config/db');
const getCategories = async () => {
  try {
    let result = await (0, db_1.poolQuery)(
      'SELECT category_id, category_name, category_description FROM VenueCategory',
      null,
    );
    return result;
  } catch (err) {
    throw err;
  }
};
exports.getCategories = getCategories;
const doesCategoryExist = async (category_id) => {
  try {
    let result = await (0, db_1.poolQuery)(
      'SELECT category_id FROM VenueCategory WHERE category_id = ?',
      [category_id],
    );
    return result.length == 1;
  } catch (err) {
    throw err;
  }
};
exports.doesCategoryExist = doesCategoryExist;
