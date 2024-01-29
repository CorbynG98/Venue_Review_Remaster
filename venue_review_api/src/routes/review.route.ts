import { Express } from 'express';
import { check } from 'express-validator';
import {
  createReview,
  getReviews,
} from '../controllers/review.controller';
import authenticate from '../util/user_authenticate.middleware';

const validateReviewData = [
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
    .post([...validateReviewData, authenticate], createReview);
};

export default user_routes;
