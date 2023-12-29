import { QueryError } from 'mysql2';
import { getPool } from '../config/db';

export default interface VenueResource {
  venue_id: string;
  admin_id: string;
  category_id: string;
  venue_name: string;
  city: string;
  short_description: string;
  long_description: string;
  date_added: Date;
  address: string;
  latitude: number;
  longitude: number;
}

const getVenues = (
  values: string[],
  where_conditions: string[],
): Promise<VenueResource[]> => {
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
      OFFSET ?`,
      values,
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const createVenue = (values: string[][]): Promise<VenueResource> => {
  return new Promise((resolve, reject) => {
    reject('Not implemented');
  });
};

const getBVenueById = (values: string[][]): Promise<VenueResource> => {
  return new Promise((resolve, reject) => {
    reject('Not implemented');
  });
};

const updateVenue = (values: string[][]): Promise<VenueResource> => {
  return new Promise((resolve, reject) => {
    reject('Not implemented');
  });
};

const checkVenueExists = (values: string[][]): Promise<VenueResource> => {
  return new Promise((resolve, reject) => {
    reject('Not implemented');
  });
};

// UPDATE THIS TO SELECT ONLY PROPERTIES WE WANT, THEN BUILD A MODEL FOR IT TO SET IN PROMISE
const checkVenueAndPhotoExists = (values: string[][]): Promise<any> => {
  return new Promise((resolve, reject) => {
    reject('Not implemented');
  });
};

export {
  checkVenueAndPhotoExists,
  checkVenueExists,
  createVenue,
  getBVenueById,
  getVenues,
  updateVenue,
};
