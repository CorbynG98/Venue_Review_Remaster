'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_validator_1 = require('express-validator');
const user_controller_1 = require('../controllers/user.controller');
const user_authenticate_middleware_1 = __importDefault(
  require('../util/user_authenticate.middleware'),
);
function testEmail(email) {
  let re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
const validateUserData = [
  (0, express_validator_1.check)('username')
    .notEmpty()
    .withMessage('Username is required'),
  (0, express_validator_1.check)('email')
    .custom((value) => {
      if (!value || value.trim() === '') {
        return false;
      }
      return testEmail(value);
    })
    .withMessage('Email is required'),
  (0, express_validator_1.check)('given_name')
    .notEmpty()
    .withMessage('Given name is required'),
  (0, express_validator_1.check)('family_name')
    .notEmpty()
    .withMessage('Family name is required'),
];
const user_routes = (app) => {
  app
    .route('/users')
    .patch(
      [...validateUserData, user_authenticate_middleware_1.default],
      user_controller_1.updateUser,
    );
  app
    .route('/users/photo')
    .put(user_authenticate_middleware_1.default, user_controller_1.uploadPhoto)
    .delete(
      user_authenticate_middleware_1.default,
      user_controller_1.removePhoto,
    );
};
exports.default = user_routes;
