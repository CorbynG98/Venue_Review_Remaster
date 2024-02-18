import { poolQuery } from '../config/db';

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

const getUsernameEmailById = async (
  user_id: string,
): Promise<UserResource | null> => {
  try {
    const result = (await poolQuery(
      'SELECT username, email FROM User WHERE user_id = ?',
      [user_id],
    )) as UserResource[];
    if (result == null || result.length == 0) {
      return null;
    }
    return result[0];
  } catch (err) {
    throw err;
  }
};

const getUserByEmail = async (
  email: string,
): Promise<UserIdPasswordResource | null> => {
  try {
    const result = (await poolQuery(
      'SELECT user_id, password, given_name, family_name, profile_photo_filename FROM User WHERE email = ? LIMIT 1',
      [email],
    )) as UserIdPasswordResource[];
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
    const result = (await poolQuery(
      'SELECT user_id, password, given_name, family_name, profile_photo_filename FROM User WHERE username = ? LIMIT 1',
      [username],
    )) as UserIdPasswordResource[];
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
    await poolQuery(
      'INSERT INTO User (user_id, username, email, given_name, family_name, password) VALUES (?, ?, ?, ?, ?, ?)',
      values,
    );
    return;
  } catch (err) {
    throw err;
  }
};

const updateUser = async (values: string[][]): Promise<void> => {
  try {
    await poolQuery(
      `
      UPDATE User SET
        username = ?,
        email = ?,
        given_name = ?,
        family_name = ?
      WHERE user_id = ?`,
      values,
    );
    return;
  } catch (err) {
    throw err;
  }
};

const getPhoto = async (user_id: string): Promise<string> => {
  try {
    let result = (await poolQuery(
      'SELECT profile_photo_filename FROM User WHERE user_id = ?',
      [user_id],
    )) as { profile_photo_filename: string }[];
    return result[0].profile_photo_filename;
  } catch (err) {
    throw err;
  }
};

const uploadPhoto = async (values: (string | null)[]): Promise<void> => {
  try {
    await poolQuery(
      'UPDATE User SET profile_photo_filename = ? WHERE user_id = ?',
      values,
    );
    return;
  } catch (err) {
    throw err;
  }
};

const removePhoto = async (user_id: string): Promise<void> => {
  try {
    await poolQuery(
      'UPDATE User SET profile_photo_filename = NULL WHERE user_id = ?',
      [user_id],
    );
    return;
  } catch (err) {
    throw err;
  }
};

export {
  createUser,
  getPhoto,
  getUserByEmail,
  getUserByUsername,
  getUsernameEmailById,
  removePhoto,
  updateUser,
  uploadPhoto,
};
