import { poolQuery } from '../config/db';

export default interface VenueReviewsResource {
  review_author: ReviewerAuthorResource;
  review_body: string;
  star_rating: number;
  cost_rating: string;
  time_posted: Date;
}

interface ReviewerAuthorResource {
  user_id: string;
  username: string;
}

const getVenueReviews = async (venue_id: string): Promise<VenueReviewsResource[]> => {
  try {
    let result = await poolQuery(
      `SELECT review_author_id, username, review_body, star_rating, cost_rating, time_posted 
      FROM Review 
      JOIN User ON Review.review_author_id = User.user_id 
      WHERE reviewed_venue_id = ?
      ORDER BY time_posted DESC`,
      [venue_id],
    ) as any;
    result.forEach((element: any) => {
      element.review_author = {
        user_id: element.review_author_id,
        username: element.username,
      };
      delete element.review_author_id;
      delete element.username;
    });
    return result;
  } catch (err) {
    throw err;
  }
};

// UPDATE SELECT TO GET ONLY DATA WE WANT, THEN UPDATE PROMISE TO REMOVE "ANY"
const checkReviewer = async (user_id: string, venue_id: string): Promise<boolean> => {
  try {
    let result = await poolQuery(
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
    ) as { can_review: string }[];
    return result[0].can_review == '1';
  } catch (err) {
    throw err;
  }
};

const createReview = async (values: string[]): Promise<void> => {
  try {
    await poolQuery(
      'INSERT INTO Review (review_id, reviewed_venue_id, review_body, star_rating, cost_rating, time_posted, review_author_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      values,
    );
    return
  } catch (err) {
    throw err;
  }
};

export { checkReviewer, createReview, getVenueReviews };

