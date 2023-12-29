import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import logger from 'morgan';
import multer from 'multer';

import auth_routes from '../routes/auth.route';
import review_routes from '../routes/review.route';
import user_routes from '../routes/user.route';
import venue_routes from '../routes/venue.route';

// Some configuration for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const allowCrossOriginRequests = function (
  req: Request,
  res: Response,
  next: Function,
) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, X-Authorization',
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
};

const initApp = () => {
  const app = express();

  // MIDDLEWARE
  app.use(logger('dev'));
  app.use(allowCrossOriginRequests);
  // Body parser configuration
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.raw({ type: 'image/png' }));
  app.use(bodyParser.raw({ type: 'image/jpeg' }));
  // multipart/form-data requests
  app.use(upload.single('photo'));
  // Add CORS middleware
  app.use(cors());

  // ROUTES
  auth_routes(app);
  review_routes(app);
  user_routes(app);
  venue_routes(app);

  return app;
};

export default initApp();
