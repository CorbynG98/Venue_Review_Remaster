import { poolQuery } from '../config/db';

export default interface VenueCategoryResource {
  category_id: string;
  category_name: string;
  category_description: string;
}

const getCategories = async (): Promise<VenueCategoryResource[]> => {
  try {
    let result = await poolQuery(
      'SELECT category_id, category_name, category_description FROM VenueCategory',
      null
    ) as VenueCategoryResource[];
    return result;
  } catch (err) {
    throw err;
  }
};

const doesCategoryExist = async (category_id: string): Promise<boolean> => {
  try {
    let result = await poolQuery(
      'SELECT category_id FROM VenueCategory WHERE category_id = ?',
      [category_id],
    ) as { category_id: string }[];
    return result.length == 1;
  } catch (err) {
    throw err;
  }
};

export { doesCategoryExist, getCategories };

