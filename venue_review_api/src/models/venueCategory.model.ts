import { QueryError } from 'mysql2';
import { getPool } from '../config/db';

export default interface VenueCategoryResource {
  category_id: string;
  category_name: string;
  category_description: string;
}

const getCategories = (
  values: string[][],
): Promise<VenueCategoryResource[]> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'SELECT category_id, category_name, category_description FROM VenueCategory',
      values,
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

export { getCategories };
