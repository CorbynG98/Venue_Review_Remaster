import crypto from 'crypto';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getByToken as get_session_by_token } from '../models/sessions.model';
import { getCategories as get_categories } from '../models/venueCategory.model';
import {
  ensureOnlyOnePrimary as ensure_one_primary,
  setPrimaryPhoto as make_new_primary,
  randomNewPrimary as make_random_primary,
  removeVenuePhoto as remove_venue_photo,
  createVenuePhoto as upload_venue_photo,
} from '../models/venuePhoto.model';
import {
  createVenue as create_venue,
  getVenueById as get_venue_by_id,
  getVenues as get_venues,
  updateVenue as update_venue,
} from '../models/venues.model';
import {
  removeFile as remove_file,
  uploadFile as upload_file,
} from '../util/google_cloud_storage.helper';

interface Params {
  category_id: string | null;
  admin_id: string | null;
  city: string | null;
  venue_name: string | null;
}

const venuePhotoBucket = 'venue-review-venue-image';

function generateConditionsAndValues(params: Params) {
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

function generateOrderByCondition(sortBy: string, isDesc: boolean) {
  switch (sortBy) {
    case 'avg_star_rating':
      return `ORDER BY avg_star_rating ${isDesc ? 'DESC' : 'ASC'}`;
    case 'avg_cost_rating':
      return `ORDER BY avg_cost_rating ${isDesc ? 'DESC' : 'ASC'}`;
    default:
      return `ORDER BY distance ${isDesc ? 'DESC' : 'ASC'}`;
  }
}

const getVenues = async (req: Request, res: Response) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ errors: validation.array() });
  }

  let params: Params = {
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
    Number(limit), // Result count
    Number(offset),
  ] as string[];

  let orderByCondition = generateOrderByCondition(
    req.query.sortBy?.toString() ?? 'distance',
    req.query.isDesc == 'true',
  );

  get_venues(values, conditions, orderByCondition)
    .then((venues) => {
      res.status(200).json(venues);
    })
    .catch((err) => {
      res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

const createVenue = async (req: Request, res: Response) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ errors: validation.array() });
  }

  // Only doing this so we can get the admin_id. Not verifying auth, that has already been done.
  // Because we have already checked, we shouldn't have to try catch this code either.
  // We know it's valid at this point, and can trust the process.
  let token = req.header('Authorization')?.toString() ?? '';
  let hashedToken = crypto.createHash('sha512').update(token).digest('hex');
  let user_id = await get_session_by_token(hashedToken);

  let values = [
    uuidv4().replace(/-/g, ''),
    req.body.venue_name,
    req.body.category_id,
    req.body.city,
    req.body.short_description,
    req.body.long_description,
    req.body.address,
    req.body.latitude,
    req.body.longitude,
    user_id,
    new Date(),
  ];

  create_venue(values)
    .then(() => {
      res.status(201).json({ status: 201, message: values[0] });
    })
    .catch((err) => {
      res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

const getById = async (req: Request, res: Response) => {
  get_venue_by_id(req.params.id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

const updateVenue = async (req: Request, res: Response) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ errors: validation.array() });
  }

  let values = [
    req.body.venue_name,
    req.body.category_id,
    req.body.city,
    req.body.short_description,
    req.body.long_description,
    req.body.address,
    req.body.latitude,
    req.body.longitude,
    req.params.id,
  ];

  update_venue(values)
    .then(() => {
      res.status(200).json({ status: 200, message: req.params.id });
    })
    .catch((err) => {
      res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

const getCategories = async (req: Request, res: Response) => {
  get_categories()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

const createVenuePhoto = async (req: Request, res: Response) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ errors: validation.array() });
  }
  let venue_id = req.params.id;

  if (req.file == null)
    return res.status(400).json({ status: 400, message: 'No file provided.' });

  let image = req.file.buffer;
  let imageExt = req.file.mimetype.split('/')[1];
  let fileName = `${venue_id}-${uuidv4().replace(/-/g, '')}.${imageExt}`;

  let imageDIR = `./${venuePhotoBucket}`;
  if (!fs.existsSync(imageDIR)) {
    fs.mkdirSync(imageDIR);
  }

  try {
    fs.writeFileSync(`${imageDIR}/${fileName}`, image);
    let filePath = path.resolve(`${imageDIR}/${fileName}`);
    upload_file(filePath, venuePhotoBucket).then((result) => {
      fs.rmSync(imageDIR, { recursive: true }); // Delete the local file now that storage upload succeeded
      let values = [
        venue_id,
        result,
        req.body.description,
        req.body.is_primary == 'true',
      ];
      upload_venue_photo(values)
        .then(() => {
          if (req.body.is_primary as boolean) {
            // Make sure others are not primary
            ensure_one_primary([venue_id, result]).then(() => {
              res.status(201).json({ status: 201, message: result });
            });
          } else {
            res.status(201).json({ status: 201, message: result });
          }
        })
        .catch((err) => {
          res.status(500).json({ status: 500, message: err?.code ?? err });
        });
    });
  } catch (err) {
    fs.rmSync(imageDIR, { recursive: true }); // Delete the local file, we had a failure, and don't want these to hang around.
    res.status(500).json({ status: 500, message: err });
  }
};

const removePhoto = async (req: Request, res: Response) => {
  let venue_id = req.params.id;
  let filename = req.params.photoFilename;

  let values = [venue_id, filename];

  remove_file(filename, venuePhotoBucket).then(() => {
    remove_venue_photo(values)
      .then((result) => {
        if (result == null) {
          return res
            .status(404)
            .json({ status: 404, message: 'No photo to remove.' });
        }
        make_random_primary(venue_id).then(() => {
          res.status(200).json({ status: 204, message: 'No Content.' });
        });
      })
      .catch((err) => {
        res.status(500).json({ status: 500, message: err?.code ?? err });
      });
  });
};

const setNewPrimary = async (req: Request, res: Response) => {
  let venue_id = req.params.id;
  let filename = req.params.photoFilename;

  let values = [venue_id, filename];

  make_new_primary(values)
    .then(() => {
      make_random_primary(venue_id).then(() => {
        res.status(200).json({ status: 200, message: 'OK' });
      });
    })
    .catch((err) => {
      res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

export {
  createVenue,
  createVenuePhoto,
  getById,
  getCategories,
  getVenues,
  removePhoto,
  setNewPrimary,
  updateVenue,
};
