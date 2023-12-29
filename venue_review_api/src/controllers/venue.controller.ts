import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getVenues as get_venues } from '../models/venues.model';

interface params {
  category_id: string | null;
  admin_id: string | null;
  city: string | null;
  venue_name: string | null;
}

function generateConditionsAndValues(params: params) {
  const conditions = [];
  const condition_values = [];

  for (const [key, value] of Object.entries(params)) {
    switch (key) {
      case 'name':
        conditions.push(`(v.${key} LIKE ? OR ? IS NULL)`);
        break;
      default:
        conditions.push(`(v.${key} = ? OR ? IS NULL)`);
        break;
    }
    condition_values.push(value, value);
  }

  return { conditions, condition_values };
}

const getVenues = async (req: Request, res: Response) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ errors: validation.array() });
  }

  let params: params = {
    category_id:
      req.query.category != null && req.query.category.toString().length > 0
        ? `${req.query.category?.toString()}`
        : null,
    admin_id:
      req.query.admin != null && req.query.admin.toString().length > 0
        ? `${req.query.admin?.toString()}`
        : null,
    city:
      req.query.city != null && req.query.city.toString().length > 0
        ? `${req.query.city?.toString()}`
        : null,
    venue_name:
      req.query.name != null && req.query.name.toString().length > 0
        ? `%${req.query.name?.toString()}%`
        : null,
  };
  const { conditions, condition_values } = generateConditionsAndValues(params);

  let offset =
    req.query.page != null
      ? (Number(req.query.page) - 1) * Number(req.query.limit)
      : 0;
  let limit = req.query.limit ?? 10;

  // Cleaning value data before pumping into the SQL query
  let latitude =
    req.query.latitude != null && req.query.latitude.toString().length > 0
      ? req.query.latitude?.toString()
      : '0';
  let longitude =
    req.query.longitude != null && req.query.longitude.toString().length > 0
      ? req.query.longitude?.toString()
      : '0';

  let maxCostRating =
    req.query.maxCostRating != null &&
    req.query.maxCostRating.toString().length > 0
      ? Number(req.query.maxCostRating?.toString())
      : null;
  let minStarRating =
    req.query.minStarRating != null &&
    req.query.minStarRating.toString().length > 0
      ? Number(req.query.minStarRating?.toString())
      : null;

  // values = [lat, lat, long, where_condition_values, cost, cost, star, star, order, limit, offset]
  let values = [
    Number(latitude),
    Number(latitude),
    Number(longitude),
    ...condition_values, // Where condition values, see generateConditionsAndValues()
    maxCostRating, // Need 2 of these because of the HAVING clause
    maxCostRating,
    minStarRating, // Need 2 of these because of the HAVING clause
    minStarRating,
    req.query.sortBy != null && req.query.isDesc != null
      ? `${req.query.sortBy} ${req.query.isDesc ? 'DESC' : 'ASC'}`
      : 'avg_star_rating DESC',
    Number(limit), // Result count
    Number(offset),
  ] as string[];

  get_venues(values, conditions)
    .then((venues) => {
      res.status(200).json(venues);
    })
    .catch((err) => {
      res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

const createVenue = async (req: Request, res: Response) => {
  throw new Error('Not implemented');
};

const getById = async (req: Request, res: Response) => {
  throw new Error('Not implemented');
};

const updateVenue = async (req: Request, res: Response) => {
  throw new Error('Not implemented');
};

const getCategories = async (req: Request, res: Response) => {
  throw new Error('Not implemented');
};

const createVenuePhoto = async (req: Request, res: Response) => {
  throw new Error('Not implemented');
};

const getPhotoByFilename = async (req: Request, res: Response) => {
  throw new Error('Not implemented');
};

const removePhoto = async (req: Request, res: Response) => {
  throw new Error('Not implemented');
};

const setNewPrimary = async (req: Request, res: Response) => {
  throw new Error('Not implemented');
};

export {
  createVenue,
  createVenuePhoto,
  getById,
  getCategories,
  getPhotoByFilename,
  getVenues,
  removePhoto,
  setNewPrimary,
  updateVenue,
};
