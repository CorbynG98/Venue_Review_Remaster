import { Express } from 'express';
import { check } from 'express-validator';
import { create, login, signout } from '../controllers/auth.controller';
import authenticate from '../util/user_authenticate.middleware';

function testEmail(email: string) {
  let re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const validateUsernameAndPassword = [
  check('username')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return false;
      }
      return value.length >= 3;
    })
    .withMessage('Email is required'),
  check('password')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return false;
      }
      return value.length >= 8;
    })
    .withMessage('Password is required and needs to be 8 or more characters'),
];

const validateSignupData = [
  check('email')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return false;
      }
      return testEmail(value);
    })
    .withMessage('Email is required'),
  check('password')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return false;
      }
      return value.length >= 8;
    })
    .withMessage('Password is required and needs to be 8 or more characters'),
  check('username')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return false;
      }
      return value.length >= 3;
    })
    .withMessage('Username is required'),
  check('givenName').notEmpty().withMessage('Given name is required'),
  check('familyName').notEmpty().withMessage('Family name is required'),
];

const user_routes = (app: Express) => {
  app.route('/auth/signin').post(validateUsernameAndPassword, login);
  app.route('/auth/signup').post(validateSignupData, create);
  app.route('/auth/signout').post(authenticate, signout);
};

export default user_routes;
