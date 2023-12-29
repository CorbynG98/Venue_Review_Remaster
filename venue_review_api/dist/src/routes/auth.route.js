'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_validator_1 = require('express-validator');
const auth_controller_1 = require('../controllers/auth.controller');
const authenticate_middleware_1 = __importDefault(
  require('../util/authenticate.middleware'),
);
function testEmail(email) {
  let re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
const validateUsernameAndPassword = [
  (0, express_validator_1.check)('username')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return false;
      }
      return value.length >= 3;
    })
    .withMessage('Email is required'),
  (0, express_validator_1.check)('password')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return false;
      }
      return value.length >= 8;
    })
    .withMessage('Password is required and needs to be 8 or more characters'),
];
const validateSignupData = [
  (0, express_validator_1.check)('email')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return false;
      }
      return testEmail(value);
    })
    .withMessage('Email is required'),
  (0, express_validator_1.check)('password')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return false;
      }
      return value.length >= 8;
    })
    .withMessage('Password is required and needs to be 8 or more characters'),
  (0, express_validator_1.check)('username')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return false;
      }
      return value.length >= 3;
    })
    .withMessage('Username is required'),
  (0, express_validator_1.check)('givenName')
    .notEmpty()
    .withMessage('Given name is required'),
  (0, express_validator_1.check)('familyName')
    .notEmpty()
    .withMessage('Family name is required'),
];
const user_routes = (app) => {
  app
    .route('/auth/signin')
    .post(validateUsernameAndPassword, auth_controller_1.login);
  app.route('/auth/signup').post(validateSignupData, auth_controller_1.create);
  app
    .route('/auth/signout')
    .post(authenticate_middleware_1.default, auth_controller_1.signout);
};
exports.default = user_routes;
