import { Express } from 'express';
import { check } from 'express-validator';
import {
  removePhoto,
  updateUser,
  uploadPhoto,
} from '../controllers/user.controller';
import authenticate from '../util/user_authenticate.middleware';

function testEmail(email: string) {
  let re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const validateUserData = [
  check('username').notEmpty().withMessage('Username is required'),
  check('email')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return false;
      }
      return testEmail(value);
    })
    .withMessage('Email is required'),
  check('given_name').notEmpty().withMessage('Given name is required'),
  check('family_name').notEmpty().withMessage('Family name is required'),
];

const user_routes = (app: Express) => {
  app.route('/users').patch([...validateUserData, authenticate], updateUser);

  app
    .route('/users/photo')
    .put(authenticate, uploadPhoto)
    .delete(authenticate, removePhoto);
};

export default user_routes;
