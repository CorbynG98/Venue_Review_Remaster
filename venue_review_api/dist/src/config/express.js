'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const body_parser_1 = __importDefault(require('body-parser'));
const cors_1 = __importDefault(require('cors'));
const express_1 = __importDefault(require('express'));
const morgan_1 = __importDefault(require('morgan'));
const multer_1 = __importDefault(require('multer'));
const auth_route_1 = __importDefault(require('../routes/auth.route'));
const review_route_1 = __importDefault(require('../routes/review.route'));
const user_route_1 = __importDefault(require('../routes/user.route'));
const venue_route_1 = __importDefault(require('../routes/venue.route'));
// Some configuration for multer
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const allowCrossOriginRequests = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, X-Authorization',
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
};
const initApp = () => {
  const app = (0, express_1.default)();
  // MIDDLEWARE
  app.use((0, morgan_1.default)('dev'));
  app.use(allowCrossOriginRequests);
  // Body parser configuration
  app.use(body_parser_1.default.json());
  app.use(body_parser_1.default.urlencoded({ extended: true }));
  app.use(body_parser_1.default.raw({ type: 'image/png' }));
  app.use(body_parser_1.default.raw({ type: 'image/jpeg' }));
  // Add multer middleware
  app.use((req, res, next) => {
    upload.single('photo')(req, res, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        next();
      }
    });
  });
  // Add CORS middleware
  app.use((0, cors_1.default)());
  // ROUTES
  (0, auth_route_1.default)(app);
  (0, review_route_1.default)(app);
  (0, user_route_1.default)(app);
  (0, venue_route_1.default)(app);
  return app;
};
exports.default = initApp();
