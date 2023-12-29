import { QueryError } from 'mysql2';
import { getPool } from '../config/db';

export default interface SessionResource {
  session_token: string;
  created_at: Date;
  user_id: string;
}

const createSession = (values: (string | Date | null)[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'INSERT INTO Session (session_id, token, created_at, expiry, user_id) VALUES (?, ?, ?, ?, ?)',
      values,
      (err: QueryError | null) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};

const getByToken = (token: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'SELECT user_id FROM Session WHERE token = ? LIMIT 1',
      token,
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        if (result == '' || result == null || result.length == 0)
          return reject(null);
        return resolve(result[0].user_id as string);
      },
    );
  });
};

const removeSession = (token: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'DELETE FROM Session WHERE token = ?',
      token,
      (err: QueryError | null) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};

export { createSession, getByToken, removeSession };
