import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { getByToken } from '../models/sessions.model';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');

  // Validate token
  if (!token) {
    return res.status(401).json('Access denied. No token provided.');
  }

  let hashedToked = crypto.createHash('sha512').update(token).digest('hex');
  getByToken(hashedToked)
    .then(() => {
      next();
    })
    .catch(() => {
      return res.status(403).json('Access denied. Invalid token.');
    });
};

export default authenticate;
