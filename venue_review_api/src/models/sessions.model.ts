import { QueryError } from 'mysql2';
import { getPool, poolQuery } from '../config/db';

export default interface SessionResource {
  token: string;
  created_at: Date;
  user_id: string;
}

const createSession = async (values: (string | Date | null)[]): Promise<void> => {
  try {
    var result = await poolQuery('INSERT INTO Session (session_id, token, created_at, expiry, user_id) VALUES (?, ?, ?, ?, ?)', values);
    return;
  } catch (err) {
    throw err;
  }
};

const getByToken = async (token: string): Promise<string | null> => {
  try {
    var result = await poolQuery('SELECT user_id FROM Session WHERE token = ? LIMIT 1', [token]) as SessionResource[];
    if (result == null || result.length != 1) throw new Error('Invalid token.');
    return result[0].user_id;
  } catch (err) {
    throw new Error('Invalid token.');
  }
};

const removeSession = async (token: string): Promise<void> => {
  try {
    await poolQuery('DELETE FROM Session WHERE token = ?', [token]);
    return;
  } catch (err) {
    throw err;
  }
};

const verifyVenueAuth = (
  user_id: string,
  venue_id: string,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'SELECT venue_id FROM Venue WHERE admin_id = ? AND venue_id = ?',
      [user_id, venue_id],
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        if (result == '' || result == null || result.length == 0)
          return reject(null);
        return resolve(true);
      },
    );
  });
};

export { createSession, getByToken, removeSession, verifyVenueAuth };

