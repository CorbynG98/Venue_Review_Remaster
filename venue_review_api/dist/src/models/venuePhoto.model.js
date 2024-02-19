'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.setPrimaryPhoto =
  exports.removeVenuePhoto =
  exports.randomNewPrimary =
  exports.ensureOnlyOnePrimary =
  exports.createVenuePhoto =
    void 0;
const db_1 = require('../config/db');
const createVenuePhoto = async (values) => {
  try {
    await (0, db_1.poolQuery)(
      'INSERT INTO VenuePhoto (venue_photo_id, venue_id, photo_filename, photo_description, is_primary) VALUES (?, ?, ?, ?, ?)',
      values,
    );
    return;
  } catch (err) {
    throw err;
  }
};
exports.createVenuePhoto = createVenuePhoto;
const ensureOnlyOnePrimary = async (values) => {
  try {
    await (0, db_1.poolQuery)(
      'UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = ? AND venue_photo_id != ?',
      values,
    );
    return;
  } catch (err) {
    throw err;
  }
};
exports.ensureOnlyOnePrimary = ensureOnlyOnePrimary;
const setPrimaryPhoto = async (values) => {
  try {
    // Verify venue exists with that photo
    let venue = await (0, db_1.poolQuery)(
      'SELECT venue_id FROM VenuePhoto WHERE venue_id = ? AND venue_photo_id = ?',
      values,
    );
    if (venue == null || venue.length == 0) return false;
    // Update that venue to have a new primary
    await (0, db_1.poolQuery)(
      'UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? AND venue_photo_id = ?',
      values,
    );
    return true;
  } catch (err) {
    throw err;
  }
};
exports.setPrimaryPhoto = setPrimaryPhoto;
const randomNewPrimary = async (venue_id) => {
  try {
    // Verify venue exists with that photo
    let venue = await (0, db_1.poolQuery)(
      'SELECT venue_id, photo_filename FROM VenuePhoto WHERE venue_id = ? LIMIT 1',
      [venue_id],
    );
    if (venue == null || venue.length == 0) return;
    // Update that venue to have a new primary
    await (0, db_1.poolQuery)(
      'UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? AND venue_photo_id = ?',
      [venue[0].venue_id, venue[0].photo_filename],
    );
    return;
  } catch (err) {
    throw err;
  }
};
exports.randomNewPrimary = randomNewPrimary;
const removeVenuePhoto = async (values) => {
  try {
    // Verify venue exists with that photo
    let venue = await (0, db_1.poolQuery)(
      'SELECT is_primary, photo_filename FROM VenuePhoto WHERE venue_id = ? AND venue_photo_id = ?',
      values,
    );
    if (venue == null || venue.length == 0) return null;
    // Update that venue to have a new primary
    await (0, db_1.poolQuery)(
      'DELETE FROM VenuePhoto WHERE venue_id = ? AND venue_photo_id = ?',
      values,
    );
    return venue[0];
  } catch (err) {
    throw err;
  }
};
exports.removeVenuePhoto = removeVenuePhoto;
