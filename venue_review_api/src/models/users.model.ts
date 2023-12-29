import { QueryError } from 'mysql2';
import { getPool } from '../config/db';

export default interface UserResource {
  user_id: string;
  username: string;
  email: string;
  given_name: string;
  family_name: string;
  password: string;
  profile_photo_filename: string;
}

interface UserIdPasswordResource {
  user_id: string;
  password: string;
}

const getUserByEmail = (
  email: string,
): Promise<UserIdPasswordResource | null> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'SELECT user_id, password FROM User WHERE email = ? LIMIT 1',
      email,
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        if (result == '' || result == null || result.length == 0)
          return resolve(null);
        resolve(result[0]);
      },
    );
  });
};

const getUserByUsername = (
  username: string,
): Promise<UserIdPasswordResource | null> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'SELECT user_id, password FROM User WHERE username = ? LIMIT 1',
      username,
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        if (result == '' || result == null || result.length == 0)
          return resolve(null);
        resolve(result[0]);
      },
    );
  });
};

const createUser = (values: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'INSERT INTO User (user_id, username, email, given_name, family_name, password) VALUES (?, ?, ?, ?, ?, ?)',
      values,
      (err: QueryError | null) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};

const updateUser = (values: string[][]): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'UPDATE User SET ? VALUES ?',
      values,
      (err: QueryError | null) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};

const getPhoto = (user_id: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'SELECT profile_photo_filename FROM User WHERE user_id = ?',
      user_id,
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const uploadPhoto = (values: string[][]): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'UPDATE User SET profile_photo_filename = ? WHERE user_id = ?',
      values,
      (err: QueryError | null) => {
        if (err) return reject(err);
        return resolve();
      },
    );
  });
};

const removePhoto = (user_id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'UPDATE User SET profile_photo_filename = NULL WHERE user_id = ?',
      user_id,
      (err: QueryError | null) => {
        if (err) return reject(err);
        return resolve();
      },
    );
  });
};

export {
  createUser,
  getPhoto,
  getUserByEmail,
  getUserByUsername,
  removePhoto,
  updateUser,
  uploadPhoto,
};
