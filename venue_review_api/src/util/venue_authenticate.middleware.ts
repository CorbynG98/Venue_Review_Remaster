import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import {
  getByToken as get_by_token,
  verifyVenueAuth as verify_venue_auth,
} from '../models/sessions.model';

// This will only be used on endpoints where we are validating the user is the admin of the venue being worked with.
// Because of that, we can assume the id param will always be the venue_id and should be present. We still double check that it is present though.
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');
  const venue_id = req.params.id;

  // Validate venue_id was provided
  if (venue_id == null || venue_id.trim().length == 0) {
    return res.status(400).json('Invalid venue_id. Please try again.');
  }

  // Validate token
  if (!token) {
    return res.status(401).json('Access denied. No token provided.');
  }

  let hashedToked = crypto.createHash('sha512').update(token).digest('hex');
  get_by_token(hashedToked)
    .then((result) => {
      verify_venue_auth(result as string, venue_id)
        .then((result) => {
          if (result) next();
          else return res.status(403).json('Access denied. Invalid venue or permission to work with it.');
        })
        .catch(() => {
          return res
            .status(403)
            .json(
              'Access denied. Invalid venue or permission to work with it.',
            );
        });
    })
    .catch(() => {
      return res.status(403).json('Access denied. Invalid token.');
    });
};

export default authenticate;
