import { QueryError } from 'mysql2';
import { getPool } from '../config/db';

const createVenuePhoto = (values: (string | null)[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) VALUES (?, ?, ?, ?)',
      values,
      (err: QueryError | null) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};

const ensureOnlyOnePrimary = (values: (string | null)[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = ? AND photo_filename != ?',
      values,
      (err: QueryError | null) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};

const setPrimaryPhoto = (values: (string | null)[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? AND photo_filename = ?',
      values,
      (err: QueryError | null) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};

const randomNewPrimary = (venue_id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'SELECT venue_id, photo_filename FROM VenuePhoto WHERE venue_id = ? LIMIT 1',
      venue_id,
      (err: QueryError | null, rows: any) => {
        if (err) return reject(err);
        if (rows == '' || rows == null || rows.length == 0) resolve();
        getPool().query(
          'UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? AND photo_filename = ?',
          [[rows[0].venue_id], [rows[0].photo_filename]],
          (err: QueryError | null, result: any) => {
            if (err) return reject(err);
            resolve();
          },
        );
      },
    );
  });
};

const removeVenuePhoto = (
  values: (string | null)[],
): Promise<boolean | null> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'SELECT is_primary FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?',
      values,
      (err: QueryError | null, rows: any) => {
        if (err) return reject(err);
        if (rows == '' || rows == null || rows.length == 0) resolve(null);
        getPool().query(
          'DELETE FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?',
          values,
          (err: QueryError | null) => {
            if (err) return reject(err);
            resolve(rows[0].is_primary == '1');
          },
        );
      },
    );
  });
};

export {
  createVenuePhoto,
  ensureOnlyOnePrimary,
  randomNewPrimary,
  removeVenuePhoto,
  setPrimaryPhoto,
};
