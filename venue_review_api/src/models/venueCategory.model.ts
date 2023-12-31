import { QueryError } from 'mysql2';
import { getPool } from '../config/db';

export default interface VenueCategoryResource {
  category_id: string;
  category_name: string;
  category_description: string;
}

const getCategories = (): Promise<VenueCategoryResource[]> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'SELECT category_id, category_name, category_description FROM VenueCategory',
      null,
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const doesCategoryExist = (category_id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    getPool().query(
      'SELECT category_id FROM VenueCategory WHERE category_id = ?',
      category_id,
      (err: QueryError | null, result: any) => {
        if (err) return reject(err);
        resolve(result.length == 1);
      },
    );
  });
};

export { doesCategoryExist, getCategories };
