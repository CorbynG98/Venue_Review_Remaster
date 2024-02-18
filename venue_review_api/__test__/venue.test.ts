import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import supertest from 'supertest';
import * as db from '../src/config/db';
import server from '../src/config/express';
import * as storage from '../src/util/google_cloud_storage.helper';
import { bobby1_session_mock } from './mocks/session_mocks';
import { blackpanther_mock, bobby1_mock } from './mocks/user_mocks';
import { categories, venue_by_id, venues_no_filter } from './mocks/venue_mocks';

const requestWithSupertest = supertest(server);

// Safety fallback check for test ENV
if (process.env.NODE_ENV !== 'test') {
  throw new Error('ENVIRONMENT NOT SET TO TEST. FAILING WITH ERROR.');
}

const sessionToken: string = 'random_session_token';
const hashedSessionToken: string = crypto
  .createHash('sha512')
  .update(sessionToken)
  .digest('hex');

beforeAll(async () => {
  jest.spyOn(db, 'poolQuery').mockImplementation((sql, params) => {
    return new Promise((resolve, reject) => {
      sql = sql.replace(/\n|\t/g, '').replace(/\s+/g, ' ').trim(); // Remove newlines and tabs from sql, for comparison matching only
      let generalSelectRegex = new RegExp('^SELECT.*OFFSET.*$', 'ig');
      let selectByIdRegex = new RegExp('^SELECT.*GROUP.*BY.*$', 'ig');
      if (
        sql.startsWith('SELECT user_id, password') ||
        sql.startsWith('SELECT username, email')
      ) {
        if (
          params[0] === 'black.panther' ||
          params[0] == 'black.panther@super.heroes'
        ) {
          return resolve([blackpanther_mock]);
        }
        if (
          params[0] === 'bobby1' ||
          params[0] == 'bob.roberts@gmail.com' ||
          params[0] == 'c48a5cfd48b94ac68787a3776d6ae78d'
        ) {
          return resolve([bobby1_mock]);
        }
      } else if (generalSelectRegex.test(sql)) {
        return resolve(venues_no_filter);
      } else if (
        selectByIdRegex.test(sql) &&
        params == 'b043f010284448e382d69571fae06808'
      ) {
        return resolve([venue_by_id]);
      } else if (
        sql.startsWith(
          'SELECT category_id, category_name, category_description',
        )
      ) {
        return resolve(categories);
      } else if (
        sql.startsWith('SELECT user_id FROM Session') &&
        params[0] == hashedSessionToken
      ) {
        return resolve([bobby1_session_mock]);
      } else if (
        sql.startsWith('SELECT category_id FROM VenueCategory WHERE') &&
        params[0] == '2a239543024042259c93a25208acefa3'
      ) {
        return resolve([{ category_id: '2a239543024042259c93a25208acefa3' }]);
      } else if (
        sql.startsWith('SELECT venue_id FROM Venue WHERE') &&
        params[0] == 'c48a5cfd48b94ac68787a3776d6ae78d' &&
        params[1] == '8b5db9ca7d6f41e398bf551230d7fc23'
      ) {
        return resolve([{ venue_id: '8b5db9ca7d6f41e398bf551230d7fc23' }]);
      }
      return resolve([]);
    });
  });
  // Create a dummy image file
  fs.writeFileSync(
    path.join(__dirname, './resources/test-image-venue.png'),
    'mock content',
  );
  jest.spyOn(storage, 'uploadFile').mockImplementation((file) => {
    return new Promise((resolve, reject) => {
      return resolve('https://storage.googleapis.com/venuereview/1234');
    });
  });
  jest.spyOn(storage, 'removeFile').mockImplementation(() => {
    return new Promise((resolve, reject) => {
      return resolve();
    });
  });
});

describe('Get Venues', () => {
  it('GET /venues without filtering params should succeed', async () => {
    let response = await requestWithSupertest
      .get('/venues')
      .query({
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(3);
    expect(response.body[0]).toHaveProperty('primary_photo');
  });

  it('GET /venues with valid latitude should succeed', async () => {
    let response = await requestWithSupertest
      .get('/venues')
      .query({
        latitude: 45,
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(3);
    expect(response.body[0]).toHaveProperty('primary_photo');
  });

  it('GET /venues with valid longitude should succeed', async () => {
    let response = await requestWithSupertest
      .get('/venues')
      .query({
        longitude: 45,
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(3);
    expect(response.body[0]).toHaveProperty('primary_photo');
  });

  it('GET /venues with valid minStarRating should succeed', async () => {
    let response = await requestWithSupertest
      .get('/venues')
      .query({
        minStarRating: 1,
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0]).toHaveProperty('primary_photo');
  });

  it('GET /venues with valid category_id should succeed', async () => {
    let response = await requestWithSupertest
      .get('/venues')
      .query({
        category_id: '2a239543024042259c93a25208acefa3',
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0]).toHaveProperty('primary_photo');
  });

  it('GET /venues with valid admin_id should succeed', async () => {
    let response = await requestWithSupertest
      .get('/venues')
      .query({
        admin_id: '9f0c0ea5674e485dabe8d805b16126b4',
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0]).toHaveProperty('primary_photo');
  });

  it('GET /venues with distance sort descending should succeed', async () => {
    let response = await requestWithSupertest
      .get('/venues')
      .query({
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /venues with distance sort ascending should succeed', async () => {
    let response = await requestWithSupertest
      .get('/venues')
      .query({
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: false,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /venues with star_rating sort descending should succeed', async () => {
    let response = await requestWithSupertest
      .get('/venues')
      .query({
        page: 1,
        limit: 10,
        sortBy: 'avg_star_rating',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /venues with star_rating sort ascending should succeed', async () => {
    let response = await requestWithSupertest
      .get('/venues')
      .query({
        page: 1,
        limit: 10,
        sortBy: 'avg_star_rating',
        isDesc: false,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /venues with cost_rating sort descending should succeed', async () => {
    let response = await requestWithSupertest
      .get('/venues')
      .query({
        page: 1,
        limit: 10,
        sortBy: 'avg_cost_rating',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /venues with cost_rating sort ascending should succeed', async () => {
    let response = await requestWithSupertest
      .get('/venues')
      .query({
        page: 1,
        limit: 10,
        sortBy: 'avg_cost_rating',
        isDesc: false,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /venues with latitude below -90 should fail', async () => {
    await requestWithSupertest
      .get('/venues')
      .query({
        latitude: -91,
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('GET /venues with latitude above 90 should fail', async () => {
    await requestWithSupertest
      .get('/venues')
      .query({
        latitude: 91,
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('GET /venues with longitude below -180 should fail', async () => {
    await requestWithSupertest
      .get('/venues')
      .query({
        longitude: -181,
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('GET /venues with longitude above 180 should fail', async () => {
    await requestWithSupertest
      .get('/venues')
      .query({
        longitude: 181,
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('GET /venues with minStarRating below 0 should fail', async () => {
    await requestWithSupertest
      .get('/venues')
      .query({
        minStarRating: -1,
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('GET /venues with minStarRating above 5 should fail', async () => {
    await requestWithSupertest
      .get('/venues')
      .query({
        minStarRating: 6,
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('GET /venues with maxCostRating below 0 should fail', async () => {
    await requestWithSupertest
      .get('/venues')
      .query({
        maxCostRating: -1,
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('GET /venues with maxCostRating above 5 should fail', async () => {
    await requestWithSupertest
      .get('/venues')
      .query({
        maxCostRating: 6,
        page: 1,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('GET /venues with invalid sortBy field should fail', async () => {
    await requestWithSupertest
      .get('/venues')
      .query({
        page: 1,
        limit: 10,
        sortBy: 'venue_name',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('GET /venues with page below 1 should fail', async () => {
    await requestWithSupertest
      .get('/venues')
      .query({
        page: 0,
        limit: 10,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('GET /venues with limit below 10 should fail', async () => {
    await requestWithSupertest
      .get('/venues')
      .query({
        page: 1,
        limit: 5,
        sortBy: 'distance',
        isDesc: true,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });
});

describe('Get Categories', () => {
  it('GET /categories should succeed', async () => {
    const response = await requestWithSupertest.get('/categories').expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(5);
  });
});

describe('Create Venue', () => {
  it('POST /venues with valid data should succeed', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        long_description: 'Especially good in the summer months.',
        address: '1 North Pole',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(201);
  });

  it('POST /venues with minimal valid data should succeed', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 2',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(201);
  });

  it('POST /venues with empty name should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: '',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with no name should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with invalid category should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: 'totallyInvalid',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with empty category should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with no category should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with empty city should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        city: '',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with no city should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with empty short description should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: '',
        address: '1 North Pole',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with no short description should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        address: '1 North Pole',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with empty address should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with no address should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        latitude: -45,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with latitude less than -90 should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: -91,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with latitude greater than 90 should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: 91,
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with no latitude should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        longitude: 0,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with longitude less than -180 should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: -45,
        longitude: -181,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with longitude greater than 180 should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: -45,
        longitude: 181,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues with no longitude should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues')
      .send({
        venue_name: 'Test Venue 1',
        category_id: '2a239543024042259c93a25208acefa3',
        city: 'North Pole',
        short_description: 'The chillest place on earth.',
        address: '1 North Pole',
        latitude: -45,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });
});

describe('Get Venue By Id', () => {
  it('GET /venues/:id with a valid id should succeed', async () => {
    const response = await requestWithSupertest
      .get('/venues/b043f010284448e382d69571fae06808')
      .expect(200);

    expect(response.body).toHaveProperty('venue_name');
    expect(response.body).toHaveProperty('admin_id');
    expect(response.body).toHaveProperty('username');
    expect(response.body).toHaveProperty('category_id');
    expect(response.body).toHaveProperty('category_name');
    expect(response.body).toHaveProperty('category_description');
    expect(response.body).toHaveProperty('city');
    expect(response.body).toHaveProperty('short_description');
    expect(response.body).toHaveProperty('long_description');
    expect(response.body).toHaveProperty('date_added');
    expect(response.body).toHaveProperty('address');
    expect(response.body).toHaveProperty('latitude');
    expect(response.body).toHaveProperty('longitude');
    expect(response.body).toHaveProperty('photos');
    expect(response.body.photos.length).toBeGreaterThanOrEqual(2);
    expect(response.body.photos[0]).toHaveProperty('photo_filename');
    expect(response.body.photos[0]).toHaveProperty('photo_description');
    expect(response.body.photos[0]).toHaveProperty('is_primary_bool');
  });

  it('GET /venues/:id/reviews with an invalid id should fail', async () => {
    await requestWithSupertest.get('/venues/totallyInvalid').expect(404);
  });
});

describe('Update Venue', () => {
  it('PATCH /venues/:id with valid session and data should succeed', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('PATCH /venues/:id with a valid session and empty name should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: '',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and no name should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and empty caetgory should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: '',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and no caetgory should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and empty city should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: '',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and no city should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and empty short description should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        short_description: '',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and no short description should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and empty address should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address: '',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and no address should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and latitude less than -90 should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -91,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and latitude greater than 90 should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: 91,
        longitude: 172.582885,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and longitude less than -180 should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: -181,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with a valid session and longitude greater than 180 should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: 181,
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /venues/:id with valid data and an invalid session should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .set('Authorization', `superInvalid`)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('PATCH /venues/:id with valid data and an invalid session should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/venues/8b5db9ca7d6f41e398bf551230d7fc23')
      .send({
        venue_name: 'The Wok',
        category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1',
        city: 'Christchurch',
        short_description: 'Home of the world-famous $2 rice.',
        long_description: 'An updated description that can be considered long?',
        address:
          'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        latitude: -43.523617,
        longitude: 172.582885,
      })
      .expect('Content-Type', /json/)
      .expect(401);
  });
});
