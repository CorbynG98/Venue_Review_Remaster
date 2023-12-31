import { QueryError } from 'mysql2';
import { getPool } from '../config/db';

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
  photo_filename: string;
  photo_description: string;
  is_primary: boolean;
}

const getVenues = (
  values: (string | Number)[],
  where_conditions: string[],
  order_condition: string,
): Promise<VenueSummaryResource[]> => {
  // values = [lat, lat, long, where_conditions, cost, cost, star, star, order, limit, offset]
  return new Promise((resolve, reject) => {
    getPool().query(
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
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const createVenue = (values: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'INSERT INTO Venue (venue_id, venue_name, category_id, city, short_description, long_description, address, latitude, longitude, admin_id, date_added) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      values,
      (err: QueryError | null) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};

const getVenueById = (values: string): Promise<VenueResource | null> => {
  return new Promise((resolve, reject) => {
    getPool().query(
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
        GROUP_CONCAT(CONCAT_WS('^', vp.photo_filename, vp.photo_description, vp.is_primary) SEPARATOR '[]') as photos
      FROM Venue v
      JOIN User u ON v.admin_id = u.user_id
      JOIN VenueCategory c ON c.category_id = v.category_id
      LEFT JOIN VenuePhoto vp ON vp.venue_id = v.venue_id
      WHERE v.venue_id = ?
      GROUP BY v.venue_id;`,
      values,
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        if (result.length == 0) return resolve(null);
        // Do some processing on the photos object, to format it nicely
        result[0].photos = result[0].photos.split('[]').map((photo: string) => {
          const [photo_filename, photo_description, is_primary] =
            photo.split('^');
          let is_primary_bool = is_primary == '1' ? true : false;
          return {
            photo_filename,
            photo_description,
            is_primary_bool,
          };
        });
        resolve(result[0]);
      },
    );
  });
};

const updateVenue = (values: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
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
      (err: QueryError | null) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};

export { createVenue, getVenueById, getVenues, updateVenue };
