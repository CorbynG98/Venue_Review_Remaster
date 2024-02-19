"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVenue = exports.getVenues = exports.getVenueById = exports.createVenue = void 0;
const db_1 = require("../config/db");
const getVenues = async (values, where_conditions, order_condition) => {
    try {
        let result = (await (0, db_1.poolQuery)(`
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
      OFFSET ?`, values));
        return result;
    }
    catch (err) {
        throw err;
    }
};
exports.getVenues = getVenues;
const createVenue = async (values) => {
    try {
        await (0, db_1.poolQuery)('INSERT INTO Venue (venue_id, venue_name, category_id, city, short_description, long_description, address, latitude, longitude, admin_id, date_added) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values);
        return;
    }
    catch (err) {
        throw err;
    }
};
exports.createVenue = createVenue;
const getVenueById = async (values) => {
    try {
        let result = (await (0, db_1.poolQuery)(`
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
        IFNULL(AVG(star_rating), 0) as avg_star_rating,
        IFNULL(AVG(mode_cost_rating), 5) as avg_cost_rating,
        GROUP_CONCAT(CONCAT_WS('^', vp.venue_photo_id, vp.photo_filename, vp.photo_description, vp.is_primary) SEPARATOR '[]') as photos
      FROM Venue v
      JOIN User u ON v.admin_id = u.user_id
      JOIN VenueCategory c ON c.category_id = v.category_id
      LEFT JOIN VenuePhoto vp ON vp.venue_id = v.venue_id
      LEFT JOIN Review r ON r.reviewed_venue_id = v.venue_id
      LEFT JOIN ModeCostRating mcr on mcr.venue_id = v.venue_id
      WHERE v.venue_id = ?
      GROUP BY v.venue_id;`, values));
        if (result.length == 0)
            return null;
        // Do some processing on the photos object, to format it nicely
        // Have to do some funky work here because of a kink causing photos to duplicate in the result.
        // Haven't figured out the SQL solution just yet, but will do that some day.
        const regex = /^(\[\])+$/;
        if (regex.test(result[0].photos))
            result[0].photos = [];
        else {
            const uniquePhotos = new Set();
            result[0].photos = result[0].photos
                .split('[]')
                .map((photo) => {
                const [venue_photo_id, photo_filename, photo_description, is_primary,] = photo.split('^');
                let is_primary_bool = is_primary == '1' ? true : false;
                if (!uniquePhotos.has(venue_photo_id)) {
                    uniquePhotos.add(venue_photo_id);
                    return {
                        venue_photo_id,
                        photo_filename,
                        photo_description,
                        is_primary_bool,
                    };
                }
            })
                .filter((photo) => photo != null);
        }
        return result[0];
    }
    catch (err) {
        throw err;
    }
};
exports.getVenueById = getVenueById;
const updateVenue = async (values) => {
    try {
        await (0, db_1.poolQuery)(`
      UPDATE Venue SET
        venue_name = ?,
        category_id = ?,
        city = ?,
        short_description = ?,
        long_description = ?,
        address = ?,
        latitude = ?,
        longitude = ?
      WHERE venue_id = ?`, values);
        return;
    }
    catch (err) {
        throw err;
    }
};
exports.updateVenue = updateVenue;
