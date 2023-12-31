"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const venue_controller_1 = require("../controllers/venue.controller");
const venuePhoto_model_1 = require("../models/venuePhoto.model");
const user_authenticate_middleware_1 = __importDefault(require("../util/user_authenticate.middleware"));
const venue_authenticate_middleware_1 = __importDefault(require("../util/venue_authenticate.middleware"));
const validateVenueData = [
    (0, express_validator_1.check)('venue_name').notEmpty().withMessage('City is required'),
    (0, express_validator_1.check)('category_id').notEmpty().withMessage('City is required'),
    (0, express_validator_1.check)('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be a number between -90 and 90'),
    (0, express_validator_1.check)('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be a number between -180 and 180'),
    (0, express_validator_1.check)('city').notEmpty().withMessage('City is required'),
    (0, express_validator_1.check)('address').notEmpty().withMessage('Address is required'),
    (0, express_validator_1.check)('short_description')
        .notEmpty()
        .withMessage('Short description is required'),
    (0, express_validator_1.check)('venue_name').notEmpty().withMessage('Description is required'),
];
const validateQueryParams = [
    (0, express_validator_1.query)('latitude')
        .custom((value) => {
        if (!value || value.trim() === '') {
            return true;
        }
        if (!isNaN(parseFloat(value))) {
            let floatValue = parseFloat(value);
            if (floatValue >= -90 && floatValue <= 90) {
                return true;
            }
        }
        return false;
    })
        .withMessage('Latitude must be a number between -90 and 90.'),
    (0, express_validator_1.query)('longitude')
        .custom((value) => {
        if (!value || value.trim() === '') {
            return true;
        }
        if (!isNaN(parseFloat(value))) {
            let floatValue = parseFloat(value);
            if (floatValue >= -180 && floatValue <= 180) {
                return true;
            }
        }
        return false;
    })
        .withMessage('Longitude must be a number between -180 and 180.'),
    (0, express_validator_1.query)('minStarRating')
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
    (0, express_validator_1.query)('maxCostRating')
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
    (0, express_validator_1.query)('limit')
        .isInt({ min: 10 })
        .withMessage('Page size must be provided and be greater than or equal to 10.'),
    (0, express_validator_1.query)('page')
        .isInt({ min: 1 })
        .withMessage('Page number must be provided and be greater than or equal to 1.'),
    (0, express_validator_1.query)('sortBy')
        .isIn(['avg_star_rating', 'avg_cost_rating', 'distance'])
        .withMessage('Sort by must be one of avg_star_rating, avg_cost_rating, or distance.'),
    (0, express_validator_1.query)('isDesc')
        .isBoolean()
        .withMessage('isDesc must be a boolean (true or false).'),
];
const validatePhotoPrimaryField = [
    (0, express_validator_1.check)('is_primary')
        .custom((value) => {
        if (!value || value.trim() === '') {
            return false;
        }
        return value === 'true' || value === 'false';
    })
        .withMessage('is_primary is required and must be a boolean (true or false).'),
];
const user_routes = (app) => {
    app
        .route('/venues')
        .get(validateQueryParams, venue_controller_1.getVenues)
        .post([...validateVenueData, user_authenticate_middleware_1.default], venue_controller_1.createVenue);
    app
        .route('/venues/:id')
        .get(venue_controller_1.getById)
        .patch([...validateVenueData, venue_authenticate_middleware_1.default], venue_controller_1.updateVenue);
    app.route('/categories').get(venue_controller_1.getCategories);
    app
        .route('/venues/:id/photos')
        .post([...validatePhotoPrimaryField, venue_authenticate_middleware_1.default], venue_controller_1.createVenuePhoto);
    app
        .route('/venues/:id/photos/:photoFilename')
        .delete(venue_authenticate_middleware_1.default, venuePhoto_model_1.removeVenuePhoto);
    app
        .route('/venues/:id/photos/:photoFilename/setPrimary')
        .post([...validatePhotoPrimaryField, venue_authenticate_middleware_1.default], venue_controller_1.setNewPrimary);
};
exports.default = user_routes;
