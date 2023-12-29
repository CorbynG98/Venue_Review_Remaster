'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getVenueReviews =
  exports.getUserReviews =
  exports.createReview =
  exports.checkReviewer =
    void 0;
const db_1 = require('../config/db');
const getVenueReviews = (values) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      `SELECT review_author_id, username, review_body, star_rating, cost_rating, time_posted 
      FROM Review 
      JOIN User ON Review.review_author_id = User.user_id 
      WHERE reviewed_venue_id = ?
      ORDER BY time_posted DESC`,
      values,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};
exports.getVenueReviews = getVenueReviews;
// UPDATE SELECT TO GET ONLY DATA WE WANT, THEN UPDATE PROMISE TO REMOVE "ANY"
const checkReviewer = (user_id) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'SELECT user_id FROM Venue JOIN Review ON Review.reviewed_venue_id = venue_id WHERE Venue.admin_id = ? OR Review.review_author_id = ?',
      [user_id, user_id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};
exports.checkReviewer = checkReviewer;
const createReview = (venue_id, values) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'INSERT INTO Review (reviewed_venue_id, review_body, star_rating, cost_rating, time_posted, review_author_id) VALUES (?, ?, ?, ?, ?, ?)',
      values,
      (err, result) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};
exports.createReview = createReview;
const getUserReviews = (values) => {
  return new Promise((resolve, reject) => {
    reject('Not implemented');
  });
};
exports.getUserReviews = getUserReviews;
