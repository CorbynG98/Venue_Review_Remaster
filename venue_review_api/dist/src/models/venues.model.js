"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVenue = exports.getVenues = exports.getBVenueById = exports.createVenue = exports.checkVenueExists = exports.checkVenueAndPhotoExists = void 0;
const db_1 = require("../config/db");
const getVenues = (values, where_conditions) => {
    // values = [lat, lat, long, where_conditions, cost, cost, star, star, order, limit, offset]
    return new Promise((resolve, reject) => {
        (0, db_1.getPool)().query(`
      SELECT 
        v.venue_id,
        v.venue_name,
        v.category_id,
        v.city,
        v.short_description,
        v.latitude,
        v.longitude,
        AVG(star_rating) as avg_star_rating,
        AVG(mode_cost_rating) as avg_cost_rating,
        (SELECT photo_filename FROM VenuePhoto WHERE venue_id = v.venue_id AND is_primary IS TRUE LIMIT 1) as primary_photo, 
        ACOS(SIN(PI()*?/180.0)*SIN(PI()*v.latitude/180.0)+COS(PI()*?/180.0)*COS(PI()*v.latitude/180.0)*COS(PI()*v.longitude/180.0-PI()*?/180.0))*6371 as distance
      FROM Venue v
      LEFT JOIN Review r ON r.reviewed_venue_id = v.venue_id
      LEFT JOIN ModeCostRating mcr on mcr.venue_id = v.venue_id
      WHERE
        ${where_conditions.join(' AND ')}
      GROUP BY v.venue_id
      HAVING 
        (avg_cost_rating <= ? OR ? IS NULL)
        AND (avg_star_rating >= ? OR ? IS NULL)
      ORDER BY ?
      LIMIT ?
      OFFSET ?`, values, (err, result) => {
            if (err)
                return reject(err);
            resolve(result);
        });
    });
};
exports.getVenues = getVenues;
const createVenue = (values) => {
    return new Promise((resolve, reject) => {
        reject('Not implemented');
    });
};
exports.createVenue = createVenue;
const getBVenueById = (values) => {
    return new Promise((resolve, reject) => {
        reject('Not implemented');
    });
};
exports.getBVenueById = getBVenueById;
const updateVenue = (values) => {
    return new Promise((resolve, reject) => {
        reject('Not implemented');
    });
};
exports.updateVenue = updateVenue;
const checkVenueExists = (values) => {
    return new Promise((resolve, reject) => {
        reject('Not implemented');
    });
};
exports.checkVenueExists = checkVenueExists;
// UPDATE THIS TO SELECT ONLY PROPERTIES WE WANT, THEN BUILD A MODEL FOR IT TO SET IN PROMISE
const checkVenueAndPhotoExists = (values) => {
    return new Promise((resolve, reject) => {
        reject('Not implemented');
    });
};
exports.checkVenueAndPhotoExists = checkVenueAndPhotoExists;
