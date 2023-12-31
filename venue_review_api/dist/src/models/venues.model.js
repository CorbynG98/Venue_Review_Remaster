"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVenue = exports.getVenues = exports.getVenueById = exports.createVenue = void 0;
const db_1 = require("../config/db");
const getVenues = (values, where_conditions, order_condition) => {
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
        IFNULL(AVG(star_rating), 0) as avg_star_rating,
        IFNULL(AVG(mode_cost_rating), 5) as avg_cost_rating,
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
      ${order_condition}
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
        (0, db_1.getPool)().query('INSERT INTO Venue (venue_id, venue_name, category_id, city, short_description, long_description, address, latitude, longitude, admin_id, date_added) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
exports.createVenue = createVenue;
const getVenueById = (values) => {
    return new Promise((resolve, reject) => {
        (0, db_1.getPool)().query(`
      SELECT
        v.venue_name,
        v.admin_id,
        u.username,
        v.category_id,
        c.category_name,
        c.category_description,
        city,
        short_description,
        long_description,
        date_added,
        address,
        latitude,
        longitude,
        GROUP_CONCAT(CONCAT_WS('^', vp.photo_filename, vp.photo_description, vp.is_primary) SEPARATOR '[]') as photos
      FROM Venue v
      JOIN User u ON v.admin_id = u.user_id
      JOIN VenueCategory c ON c.category_id = v.category_id
      LEFT JOIN VenuePhoto vp ON vp.venue_id = v.venue_id
      WHERE v.venue_id = ?
      GROUP BY v.venue_id;`, values, (err, result) => {
            if (err)
                return reject(err);
            // Do some processing on the photos object, to format it nicely
            result[0].photos = result[0].photos.split('[]').map((photo) => {
                const [photo_filename, photo_description, is_primary] = photo.split('^');
                let is_primary_bool = is_primary == '1' ? true : false;
                return {
                    photo_filename,
                    photo_description,
                    is_primary_bool,
                };
            });
            resolve(result[0]);
        });
    });
};
exports.getVenueById = getVenueById;
const updateVenue = (values) => {
    return new Promise((resolve, reject) => {
        (0, db_1.getPool)().query(`
      UPDATE Venue SET
        venue_name = ?,
        category_id = ?,
        city = ?,
        short_description = ?,
        long_description = ?,
        address = ?,
        latitude = ?,
        longitude = ?
      WHERE venue_id = ?`, values, (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
exports.updateVenue = updateVenue;
