import { poolQuery } from '../config/db';

const createVenuePhoto = async (values: (string | null)[]): Promise<void> => {
  try {
    await poolQuery(
      'INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) VALUES (?, ?, ?, ?)',
      values,
    );
    return;
  } catch (err) {
    throw err;
  }
};

const ensureOnlyOnePrimary = async (values: (string | null)[]): Promise<void> => {
  try {
    await poolQuery(
      'UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = ? AND photo_filename != ?',
      values,
    );
    return;
  } catch (err) {
    throw err;
  }
};

const setPrimaryPhoto = async (
  values: (string | null)[],
): Promise<boolean | null> => {
  try {
    // Verify venue exists with that photo
    let venue = await poolQuery(
      'SELECT venue_id FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?',
      values,
    ) as { venue_id: string }[];
    if (venue == null || venue.length == 0) return false;
    // Update that venue to have a new primary
    await poolQuery(
      'UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? AND photo_filename = ?',
      values,
    );
    return true;
  } catch (err) {
    throw err;
  }
};

const randomNewPrimary = async (venue_id: string): Promise<void> => {
  try {
    // Verify venue exists with that photo
    let venue = await poolQuery(
      'SELECT venue_id, photo_filename FROM VenuePhoto WHERE venue_id = ? LIMIT 1',
      [venue_id],
    ) as { venue_id: string, photo_filename: string }[];
    if (venue == null || venue.length == 0) return;
    // Update that venue to have a new primary
    await poolQuery(
      'UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? AND photo_filename = ?',
      [venue[0].venue_id, venue[0].photo_filename],
    );
    return;
  } catch (err) {
    throw err;
  }
};

const removeVenuePhoto = async (
  values: (string | null)[],
): Promise<boolean | null> => {
  try {
    // Verify venue exists with that photo
    let venue = await poolQuery(
      'SELECT is_primary FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?',
      values,
    ) as { is_primary: string }[];
    if (venue == null || venue.length == 0) return false;
    // Update that venue to have a new primary
    await poolQuery(
      'DELETE FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?',
      values,
    );
    return venue[0].is_primary == '1';
  } catch (err) {
    throw err;
  }

};

export {
  createVenuePhoto,
  ensureOnlyOnePrimary,
  randomNewPrimary,
  removeVenuePhoto,
  setPrimaryPhoto
};

