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
        result.forEach((element) => {
          element.review_author = {
            user_id: element.review_author_id,
            username: element.username,
          };
          delete element.review_author_id;
          delete element.username;
        });
        resolve(result);
      },
    );
  });
};
exports.getVenueReviews = getVenueReviews;
// UPDATE SELECT TO GET ONLY DATA WE WANT, THEN UPDATE PROMISE TO REMOVE "ANY"
const checkReviewer = (user_id, venue_id) => {
  return new Promise((resolve, reject) => {
    // values = [venue_id, user_id, venue_id, user_id]
    (0, db_1.getPool)().query(
      `
      SELECT
        (SELECT
            CASE 
                WHEN (SELECT review_id FROM Review r WHERE r.reviewed_venue_id = ? AND r.review_author_id = ?) IS NULL THEN TRUE 
                ELSE FALSE 
            END
        ) as can_review
      FROM Venue v
      WHERE
      v.venue_id = ?
      AND v.admin_id != ?`,
      [venue_id, user_id, venue_id, user_id],
      (err, result) => {
        if (err) return reject(err);
        if (result == '' || result == null || result.length == 0)
          return resolve(false);
        resolve(result[0].can_review == '1');
      },
    );
  });
};
exports.checkReviewer = checkReviewer;
const createReview = (values) => {
  return new Promise((resolve, reject) => {
    (0, db_1.getPool)().query(
      'INSERT INTO Review (review_id, reviewed_venue_id, review_body, star_rating, cost_rating, time_posted, review_author_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      values,
      (err) => {
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
