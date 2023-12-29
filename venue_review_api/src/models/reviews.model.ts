import { QueryError } from 'mysql2';
import { getPool } from '../config/db';

export default interface VenueReviewsResource {
  review_author: ReviewerAuthorResource
  review_body: string;
  star_rating: number;
  cost_rating: string;
  time_posted: Date;
}

interface ReviewerAuthorResource {
  user_id: string;
  username: string;
}

const getVenueReviews = (values: string): Promise<VenueReviewsResource[]> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      `SELECT review_author_id, username, review_body, star_rating, cost_rating, time_posted 
      FROM Review 
      JOIN User ON Review.review_author_id = User.user_id 
      WHERE reviewed_venue_id = ?
      ORDER BY time_posted DESC`,
      values,
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);

        result.forEach((element: any) => {
          element.review_author = {
            user_id: element.review_author_id,
            username: element.username,
          };
          delete element.review_author_id;
          delete element.username;
        });

        resolve(result as VenueReviewsResource[]);
      },
    );
  });
};

// UPDATE SELECT TO GET ONLY DATA WE WANT, THEN UPDATE PROMISE TO REMOVE "ANY"
const checkReviewer = (user_id: string, venue_id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // values = [venue_id, user_id, venue_id, user_id]
    getPool().query(
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
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        if (result == '' || result == null || result.length == 0)
          return resolve(false);
        resolve(result[0].can_review == '1');
      },
    );
  });
};

const createReview = (values: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'INSERT INTO Review (review_id, reviewed_venue_id, review_body, star_rating, cost_rating, time_posted, review_author_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      values,
      (err: QueryError | null) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};

const getUserReviews = (values: string[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    reject('Not implemented');
  });
};

export { checkReviewer, createReview, getUserReviews, getVenueReviews };

