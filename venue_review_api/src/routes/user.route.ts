import { Express } from 'express';
import { check } from 'express-validator';
import {
  getPhoto,
  removePhoto,
  updateUser,
  uploadPhoto,
} from '../controllers/user.controller';
import authenticate from '../util/user_authenticate.middleware';

const validateUserData = [
  check('username').notEmpty().withMessage('Username is required'),
  check('email').notEmpty().withMessage('Email is required'),
  check('givenName').notEmpty().withMessage('Given name is required'),
  check('familyName').notEmpty().withMessage('Family name is required'),
];

const user_routes = (app: Express) => {
  app
    .route('/users/:id')
    .patch([...validateUserData, authenticate], updateUser);

  app
    .route('/users/:id/photo')
    .get(authenticate, getPhoto)
    .put(authenticate, uploadPhoto)
    .delete(authenticate, removePhoto);
};

export default user_routes;
