import { QueryError } from 'mysql2';
import { getPool, poolQuery } from '../config/db';

export default interface UserResource {
  user_id: string;
  username: string;
  email: string;
  given_name: string;
  family_name: string;
  password: string;
}

interface UserIdPasswordResource {
  user_id: string;
  password: string;
  given_name: string;
  family_name: string;
  profile_photo_filename: string;
}

const getUsernameEmailById = (
  user_id: string,
): Promise<UserResource | null> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'SELECT username, email FROM User WHERE user_id = ?',
      user_id,
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        if (result == '' || result == null || result.length == 0)
          return resolve(null);
        resolve(result[0]);
      },
    );
  });
};

const getUserByEmail = async (
  email: string,
): Promise<UserIdPasswordResource | null> => {
  try {
    const result = await poolQuery('SELECT user_id, password, given_name, family_name, profile_photo_filename FROM User WHERE email = ? LIMIT 1', [email]) as UserIdPasswordResource[];
    if (result == null || result.length == 0) {
      return null;
    }
    return result[0];
  } catch (err) {
    throw err;
  }
};

const getUserByUsername = async (
  username: string,
): Promise<UserIdPasswordResource | null> => {
  try {
    const result = await poolQuery('SELECT user_id, password, given_name, family_name, profile_photo_filename FROM User WHERE username = ? LIMIT 1', [username]) as UserIdPasswordResource[];
    if (result == null || result.length == 0) {
      return null;
    }
    return result[0];
  } catch (err) {
    throw err;
  }
};

const createUser = async (values: string[]): Promise<void> => {
  try {
    await poolQuery('INSERT INTO User (user_id, username, email, given_name, family_name, password) VALUES (?, ?, ?, ?, ?, ?)', values);
    return;
  } catch (err) {
    throw err;
  }
};

const updateUser = (values: string[][]): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      `
      UPDATE User SET
        username = ?,
        email = ?,
        given_name = ?,
        family_name = ?
      WHERE user_id = ?`,
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
        resolve(result[0].profile_photo_filename);
      },
    );
  });
};

const uploadPhoto = (values: (string | null)[]): Promise<void> => {
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
  getUsernameEmailById,
  removePhoto,
  updateUser,
  uploadPhoto
};

