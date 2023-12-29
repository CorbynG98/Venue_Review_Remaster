import { QueryError } from 'mysql2';
import { getPool } from '../config/db';

export default interface ReviewResource {
  review_id: string;
  reviewed_venue_id: string;
  review_author_id: string;
  review_body: string;
  star_rating: number;
  cost_rating: string;
  time_posted: Date;
}

const getVenueReviews = (values: string[]): Promise<ReviewResource[]> => {
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
        resolve(result);
      },
    );
  });
};

// UPDATE SELECT TO GET ONLY DATA WE WANT, THEN UPDATE PROMISE TO REMOVE "ANY"
const checkReviewer = (user_id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'SELECT user_id FROM Venue JOIN Review ON Review.reviewed_venue_id = venue_id WHERE Venue.admin_id = ? OR Review.review_author_id = ?',
      [user_id, user_id],
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const createReview = (venue_id: string, values: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'INSERT INTO Review (reviewed_venue_id, review_body, star_rating, cost_rating, time_posted, review_author_id) VALUES (?, ?, ?, ?, ?, ?)',
      values,
      (err: QueryError | null, result: any) => {
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
