import { Express } from 'express';
import { check, query } from 'express-validator';
import {
  createVenue,
  createVenuePhoto,
  getById,
  getCategories,
  getVenues,
  setNewPrimary,
  updateVenue,
} from '../controllers/venue.controller';
import { removeVenuePhoto } from '../models/venuePhoto.model';
import user_authenticate from '../util/user_authenticate.middleware';
import venue_authenticate from '../util/venue_authenticate.middleware';

const validateVenueData = [
  check('venue_name').notEmpty().withMessage('City is required'),
  check('category_id').notEmpty().withMessage('City is required'),
  check('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a number between -90 and 90'),
  check('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a number between -180 and 180'),
  check('city').notEmpty().withMessage('City is required'),
  check('address').notEmpty().withMessage('Address is required'),
  check('short_description')
    .notEmpty()
    .withMessage('Short description is required'),
  check('venue_name').notEmpty().withMessage('Description is required'),
];

const validateQueryParams = [
  query('latitude')
    .optional()
    .exists()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a number between -90 and 90.'),
  query('longitude')
    .optional()
    .exists()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a number between -180 and 180.'),
  query('limit')
    .isInt({ min: 10 })
    .withMessage(
      'Page size must be provided and be greater than or equal to 10.',
    ),
  query('page')
    .isInt({ min: 1 })
    .withMessage(
      'Page number must be provided and be greater than or equal to 1.',
    ),
  query('minStarRating')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true;
      }
      if (!isNaN(parseFloat(value))) {
        let floatValue = parseFloat(value);
        if (floatValue >= 0 && floatValue <= 5) {
          return true;
        }
      }
      return false;
    })
    .withMessage('Minimum star rating must be a number between 0 and 5.'),
  query('maxCostRating')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true;
      }
      if (!isNaN(parseFloat(value))) {
        let floatValue = parseFloat(value);
        if (floatValue >= 0 && floatValue <= 5) {
          return true;
        }
      }
      return false;
    })
    .withMessage('Maxcimum cost rating must be a number between 0 and 5.'),
  query('sortBy')
    .isIn(['star_rating', 'cost_rating', 'distance'])
    .withMessage(
      'Sort by must be one of star_rating, cost_rating, or distance.',
    ),
  query('isDesc')
    .isBoolean()
    .withMessage('isDesc must be a boolean (true or false).'),
];

const user_routes = (app: Express) => {
  app
    .route('/venues')
    .get(validateQueryParams, getVenues)
    .post([...validateVenueData, user_authenticate], createVenue);

  app
    .route('/venues/:id')
    .get(getById)
    .patch([...validateVenueData, venue_authenticate], updateVenue);

  app.route('/categories').get(getCategories);

  app.route('/venues/:id/photos').post(venue_authenticate, createVenuePhoto);

  app
    .route('/venues/:id/photos/:photoFilename')
    .delete(user_authenticate, removeVenuePhoto);

  app
    .route('/venues/:id/photos/:photoFilename/setPrimary')
    .post(venue_authenticate, setNewPrimary);
};

export default user_routes;
