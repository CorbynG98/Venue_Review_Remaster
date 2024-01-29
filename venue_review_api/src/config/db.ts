import mysql from 'mysql2';
import { promisify } from 'util';

let pool: mysql.Pool;

const createPool = async () => {
  pool = mysql.createPool({
    multipleStatements: true,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
};

const getPool = () => {
  return pool;
};

export const poolQuery = promisify((query: any, params: any, callback: any) => getPool().query(query, params, callback));

export { createPool, getPool };

