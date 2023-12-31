"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVenue = exports.setNewPrimary = exports.removePhoto = exports.getVenues = exports.getCategories = exports.getById = exports.createVenuePhoto = exports.createVenue = void 0;
const crypto_1 = __importDefault(require("crypto"));
const express_validator_1 = require("express-validator");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const sessions_model_1 = require("../models/sessions.model");
const venueCategory_model_1 = require("../models/venueCategory.model");
const venuePhoto_model_1 = require("../models/venuePhoto.model");
const venues_model_1 = require("../models/venues.model");
const google_cloud_storage_helper_1 = require("../util/google_cloud_storage.helper");
const venuePhotoBucket = 'venue-review-venue-image';
function generateConditionsAndValues(params) {
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
function generateOrderByCondition(sortBy, isDesc) {
    switch (sortBy) {
        case 'avg_star_rating':
            return `ORDER BY avg_star_rating ${isDesc ? 'DESC' : 'ASC'}`;
        case 'avg_cost_rating':
            return `ORDER BY avg_cost_rating ${isDesc ? 'DESC' : 'ASC'}`;
        default:
            return `ORDER BY distance ${isDesc ? 'DESC' : 'ASC'}`;
    }
}
const getVenues = async (req, res) => {
    const validation = (0, express_validator_1.validationResult)(req);
    if (!validation.isEmpty()) {
        return res.status(400).json({ errors: validation.array() });
    }
    let params = {
        category_id: req.query.category != null && req.query.category.toString().length > 0
            ? `${req.query.category?.toString()}`
            : null,
        admin_id: req.query.admin != null && req.query.admin.toString().length > 0
            ? `${req.query.admin?.toString()}`
            : null,
        city: req.query.city != null && req.query.city.toString().length > 0
            ? `${req.query.city?.toString()}`
            : null,
        venue_name: req.query.name != null && req.query.name.toString().length > 0
            ? `%${req.query.name?.toString()}%`
            : null,
    };
    const { conditions, condition_values } = generateConditionsAndValues(params);
    let offset = req.query.page != null
        ? (Number(req.query.page) - 1) * Number(req.query.limit)
        : 0;
    let limit = req.query.limit ?? 10;
    // Cleaning value data before pumping into the SQL query
    let latitude = req.query.latitude != null && req.query.latitude.toString().length > 0
        ? req.query.latitude?.toString()
        : '0';
    let longitude = req.query.longitude != null && req.query.longitude.toString().length > 0
        ? req.query.longitude?.toString()
        : '0';
    let maxCostRating = req.query.maxCostRating != null &&
        req.query.maxCostRating.toString().length > 0
        ? Number(req.query.maxCostRating?.toString())
        : null;
    let minStarRating = req.query.minStarRating != null &&
        req.query.minStarRating.toString().length > 0
        ? Number(req.query.minStarRating?.toString())
        : null;
    // values = [lat, lat, long, where_condition_values, cost, cost, star, star, order, limit, offset]
    let values = [
        Number(latitude),
        Number(latitude),
        Number(longitude),
        ...condition_values,
        maxCostRating,
        maxCostRating,
        minStarRating,
        minStarRating,
        Number(limit),
        Number(offset),
    ];
    let orderByCondition = generateOrderByCondition(req.query.sortBy?.toString() ?? 'distance', req.query.isDesc == 'true');
    (0, venues_model_1.getVenues)(values, conditions, orderByCondition)
        .then((venues) => {
        res.status(200).json(venues);
    })
        .catch((err) => {
        res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};
exports.getVenues = getVenues;
const createVenue = async (req, res) => {
    const validation = (0, express_validator_1.validationResult)(req);
    if (!validation.isEmpty()) {
        return res.status(400).json({ errors: validation.array() });
    }
    // Only doing this so we can get the admin_id. Not verifying auth, that has already been done.
    // Because we have already checked, we shouldn't have to try catch this code either.
    // We know it's valid at this point, and can trust the process.
    let token = req.header('Authorization')?.toString() ?? '';
    let hashedToken = crypto_1.default.createHash('sha512').update(token).digest('hex');
    let user_id = await (0, sessions_model_1.getByToken)(hashedToken);
    let values = [
        (0, uuid_1.v4)().replace(/-/g, ''),
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
    (0, venues_model_1.createVenue)(values)
        .then(() => {
        res.status(201).json({ status: 201, message: values[0] });
    })
        .catch((err) => {
        res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};
exports.createVenue = createVenue;
const getById = async (req, res) => {
    (0, venues_model_1.getVenueById)(req.params.id)
        .then((result) => {
        res.status(200).json(result);
    })
        .catch((err) => {
        res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};
exports.getById = getById;
const updateVenue = async (req, res) => {
    const validation = (0, express_validator_1.validationResult)(req);
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
    (0, venues_model_1.updateVenue)(values)
        .then(() => {
        res.status(200).json({ status: 200, message: req.params.id });
    })
        .catch((err) => {
        res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};
exports.updateVenue = updateVenue;
const getCategories = async (req, res) => {
    (0, venueCategory_model_1.getCategories)()
        .then((result) => {
        res.status(200).json(result);
    })
        .catch((err) => {
        res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};
exports.getCategories = getCategories;
const createVenuePhoto = async (req, res) => {
    const validation = (0, express_validator_1.validationResult)(req);
    if (!validation.isEmpty()) {
        return res.status(400).json({ errors: validation.array() });
    }
    let venue_id = req.params.id;
    if (req.file == null)
        return res.status(400).json({ status: 400, message: 'No file provided.' });
    let image = req.file.buffer;
    let imageExt = req.file.mimetype.split('/')[1];
    let fileName = `${venue_id}-${(0, uuid_1.v4)().replace(/-/g, '')}.${imageExt}`;
    let imageDIR = `./${venuePhotoBucket}`;
    if (!fs_1.default.existsSync(imageDIR)) {
        fs_1.default.mkdirSync(imageDIR);
    }
    try {
        fs_1.default.writeFileSync(`${imageDIR}/${fileName}`, image);
        let filePath = path_1.default.resolve(`${imageDIR}/${fileName}`);
        (0, google_cloud_storage_helper_1.uploadFile)(filePath, venuePhotoBucket).then((result) => {
            fs_1.default.rmSync(imageDIR, { recursive: true }); // Delete the local file now that storage upload succeeded
            let values = [
                venue_id,
                result,
                req.body.description,
                req.body.is_primary == 'true',
            ];
            (0, venuePhoto_model_1.createVenuePhoto)(values)
                .then(() => {
                if (req.body.is_primary) {
                    // Make sure others are not primary
                    (0, venuePhoto_model_1.ensureOnlyOnePrimary)([venue_id, result]).then(() => {
                        res.status(201).json({ status: 201, message: result });
                    });
                }
                else {
                    res.status(201).json({ status: 201, message: result });
                }
            })
                .catch((err) => {
                res.status(500).json({ status: 500, message: err?.code ?? err });
            });
        });
    }
    catch (err) {
        fs_1.default.rmSync(imageDIR, { recursive: true }); // Delete the local file, we had a failure, and don't want these to hang around.
        res.status(500).json({ status: 500, message: err });
    }
};
exports.createVenuePhoto = createVenuePhoto;
const removePhoto = async (req, res) => {
    let venue_id = req.params.id;
    let filename = req.params.photoFilename;
    let values = [venue_id, filename];
    (0, google_cloud_storage_helper_1.removeFile)(filename, venuePhotoBucket).then(() => {
        (0, venuePhoto_model_1.removeVenuePhoto)(values)
            .then((result) => {
            if (result == null) {
                return res
                    .status(404)
                    .json({ status: 404, message: 'No photo to remove.' });
            }
            (0, venuePhoto_model_1.randomNewPrimary)(venue_id).then(() => {
                res.status(200).json({ status: 204, message: 'No Content.' });
            });
        })
            .catch((err) => {
            res.status(500).json({ status: 500, message: err?.code ?? err });
        });
    });
};
exports.removePhoto = removePhoto;
const setNewPrimary = async (req, res) => {
    let venue_id = req.params.id;
    let filename = req.params.photoFilename;
    let values = [venue_id, filename];
    (0, venuePhoto_model_1.setPrimaryPhoto)(values)
        .then(() => {
        (0, venuePhoto_model_1.randomNewPrimary)(venue_id).then(() => {
            res.status(200).json({ status: 200, message: 'OK' });
        });
    })
        .catch((err) => {
        res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};
exports.setNewPrimary = setNewPrimary;
