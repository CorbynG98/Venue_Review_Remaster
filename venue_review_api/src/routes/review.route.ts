import { Express } from 'express';
import { check } from 'express-validator';
import {
  createReview,
  getReviews,
  getUserReviews,
} from '../controllers/review.controller';
import authenticate from '../util/authenticate.middleware';

const validateReviewData = [
  check('venue_id').notEmpty().withMessage('Venue is required'),
  check('review_body').notEmpty().withMessage('Body is required'),
  check('cost_rating').notEmpty().withMessage('Cost rating is required'),
  check('star_rating').notEmpty().withMessage('Star rating is required'),
  check('cost_rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Cost rating must be a number between 0 and 5'),
  check('star_rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Star rating must be a number between 0 and 5'),
];

const user_routes = (app: Express) => {
  app
    .route('/venues/:id/reviews')
    .get(getReviews)
    .patch([...validateReviewData, authenticate], createReview);

  app.route('/users/:id/reviews').get(authenticate, getUserReviews);
};

export default user_routes;
