import crypto from 'crypto';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import {
  checkReviewer as check_reviewer,
  createReview as create_review,
  getVenueReviews as get_venue_reviews,
} from '../models/reviews.model';
import { getByToken as get_session_by_token } from '../models/sessions.model';

const getReviews = async (req: Request, res: Response) => {
  get_venue_reviews(req.params.id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

const createReview = async (req: Request, res: Response) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ errors: validation.array() });
  }

  // Get the user_id from their token
  let token = req.header('Authorization')?.toString() ?? '';
  let hashedToken = crypto.createHash('sha512').update(token).digest('hex');
  let user_id = (await get_session_by_token(hashedToken)) as string;

  // Check if this user can write a review
  try {
    let review_check = await check_reviewer(user_id, req.params.id);
    if (!review_check) {
      return res.status(403).json({
        status: 403,
        message: 'You cannot write a review for this venue.',
      });
    }
  } catch (err) {
    return res.status(500).json({ status: 500, message: err });
  }
  let values = [
    uuidv4().replace(/-/g, ''),
    req.params.id,
    req.body.review_body,
    req.body.star_rating,
    req.body.cost_rating,
    new Date(),
    user_id,
  ];
  create_review(values)
    .then(() => {
      return res.status(201).json({ status: 201, message: 'Created' });
    })
    .catch((err) => {
      return res.status(500).json({ status: 500, message: err?.code ?? err });
    });
};

export { createReview, getReviews };
