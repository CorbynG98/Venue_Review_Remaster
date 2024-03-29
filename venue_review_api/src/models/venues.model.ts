import { poolQuery } from '../config/db';

export default interface VenueSummaryResource {
  venue_id: string;
  venue_name: string;
  category_id: string;
  city: string;
  short_description: string;
  latitude: number;
  longitude: number;
  avg_star_rating: number;
  avg_cost_rating: number;
  primary_photo: string;
  distance: number;
}

interface VenueResource {
  venue_name: string;
  admin_id: string;
  username: string;
  category_id: string;
  category_name: string;
  category_description: string;
  city: string;
  short_description: string;
  long_description: string;
  date_added: Date;
  address: string;
  latitude: number;
  longitude: number;
  photos: VenuePhotoResource[];
}

interface VenuePhotoResource {
  venue_photo_id: string;
  photo_filename: string;
  photo_description: string;
  is_primary: boolean;
}

const getVenues = async (
  values: (string | Number)[],
  where_conditions: string[],
  order_condition: string,
): Promise<VenueSummaryResource[]> => {
  try {
    let result = (await poolQuery(
      `
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
      OFFSET ?`,
      values,
    )) as VenueSummaryResource[];
    return result;
  } catch (err) {
    throw err;
  }
};

const createVenue = async (values: string[]): Promise<void> => {
  try {
    await poolQuery(
      'INSERT INTO Venue (venue_id, venue_name, category_id, city, short_description, long_description, address, latitude, longitude, admin_id, date_added) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      values,
    );
    return;
  } catch (err) {
    throw err;
  }
};

const getVenueById = async (values: string): Promise<VenueResource | null> => {
  try {
    let result = (await poolQuery(
      `
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
      GROUP BY v.venue_id;`,
      values,
    )) as any;
    if (result.length == 0) return null;
    // Do some processing on the photos object, to format it nicely
    // Have to do some funky work here because of a kink causing photos to duplicate in the result.
    // Haven't figured out the SQL solution just yet, but will do that some day.
    const regex = /^(\[\])+$/;
    if (regex.test(result[0].photos)) result[0].photos = [];
    else {
      const uniquePhotos = new Set<string>();
      result[0].photos = result[0].photos
        .split('[]')
        .map((photo: string) => {
          const [
            venue_photo_id,
            photo_filename,
            photo_description,
            is_primary,
          ] = photo.split('^');
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
        .filter((photo: VenuePhotoResource) => photo != null);
    }
    return result[0];
  } catch (err) {
    throw err;
  }
};

const updateVenue = async (values: string[]): Promise<void> => {
  try {
    await poolQuery(
      `
      UPDATE Venue SET
        venue_name = ?,
        category_id = ?,
        city = ?,
        short_description = ?,
        long_description = ?,
        address = ?,
        latitude = ?,
        longitude = ?
      WHERE venue_id = ?`,
      values,
    );
    return;
  } catch (err) {
    throw err;
  }
};

export { createVenue, getVenueById, getVenues, updateVenue };
