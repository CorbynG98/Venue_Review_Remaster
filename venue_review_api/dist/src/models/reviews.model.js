"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVenueReviews = exports.createReview = exports.checkReviewer = void 0;
const db_1 = require("../config/db");
const getVenueReviews = async (venue_id) => {
    try {
        let result = (await (0, db_1.poolQuery)(`SELECT review_author_id, username, profile_photo_filename, review_body, star_rating, cost_rating, time_posted 
      FROM Review 
      JOIN User ON Review.review_author_id = User.user_id 
      WHERE reviewed_venue_id = ?
      ORDER BY time_posted DESC`, [venue_id]));
        result.forEach((element) => {
            element.review_author = {
                user_id: element.review_author_id,
                username: element.username,
                profile_photo_filename: element.profile_photo_filename
            };
            delete element.review_author_id;
            delete element.username;
            delete element.profile_photo_filename;
        });
        return result;
    }
    catch (err) {
        throw err;
    }
};
exports.getVenueReviews = getVenueReviews;
// UPDATE SELECT TO GET ONLY DATA WE WANT, THEN UPDATE PROMISE TO REMOVE "ANY"
const checkReviewer = async (user_id, venue_id) => {
    try {
        let result = (await (0, db_1.poolQuery)(`
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
      AND v.admin_id != ?`, [venue_id, user_id, venue_id, user_id]));
        return result[0].can_review == '1';
    }
    catch (err) {
        throw err;
    }
};
exports.checkReviewer = checkReviewer;
const createReview = async (values) => {
    try {
        await (0, db_1.poolQuery)('INSERT INTO Review (review_id, reviewed_venue_id, review_body, star_rating, cost_rating, time_posted, review_author_id) VALUES (?, ?, ?, ?, ?, ?, ?)', values);
        return;
    }
    catch (err) {
        throw err;
    }
};
exports.createReview = createReview;
