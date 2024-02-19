import crypto from 'crypto';
import supertest from 'supertest';
import * as db from '../src/config/db';
import server from '../src/config/express';
import { thewok_reviews_mock } from './mocks/review_mocks';
import { bobby1_session_mock } from './mocks/session_mocks';

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
      if (sql.startsWith('SELECT review_author_id, username, profile_photo_filename, review_body')) {
        if (params[0] === '8b5db9ca7d6f41e398bf551230d7fc23') {
          return resolve(thewok_reviews_mock);
        } else if (params[0] === 'totallyInvalid') {
          return resolve([]);
        }
      } else if (sql.startsWith('SELECT user_id FROM Session')) {
        if (params[0] == hashedSessionToken) {
          return resolve([bobby1_session_mock]);
        }
      } else if (sql.startsWith('SELECT (SELECT CASE WHEN (SELECT review_id')) {
        if (
          params[0] == 'b043f010284448e382d69571fae06808' &&
          params[1] == 'c48a5cfd48b94ac68787a3776d6ae78d'
        )
          return resolve([{ can_review: '1' }]);
        resolve([{ can_review: '0' }]);
      }
      return resolve([]);
    });
  });
});

describe('Get Reviews', () => {
  it('GET /venues/:id/reviews with a valid id should succeed', async () => {
    const response = await requestWithSupertest
      .get('/venues/8b5db9ca7d6f41e398bf551230d7fc23/reviews')
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(2);
    expect(response.body[0]).toHaveProperty('review_author');
    expect(response.body[0].review_author).toHaveProperty('user_id');
    expect(response.body[0].review_author).toHaveProperty('username');
    expect(response.body[0].review_author).toHaveProperty('profile_photo_filename');
    expect(response.body[0]).toHaveProperty('review_body');
    expect(response.body[0]).toHaveProperty('cost_rating');
    expect(response.body[0]).toHaveProperty('star_rating');
    expect(response.body[0]).toHaveProperty('time_posted');
  });

  it('GET /venues/:id/reviews with an invalid id should pass with 0 results', async () => {
    var response = await requestWithSupertest
      .get('/venues/totallyInvalid/reviews')
      .expect(200);

    expect(response.body.length).toEqual(0);
  });

  it('GET /venues/:id/reviews with no id should succeed with no data', async () => {
    await requestWithSupertest.get('/venues//reviews').expect(404);
  });
});

describe('Create Reviews', () => {
  it('POST /venues/:id/reviews with valid data should succeed', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        star_rating: 5,
        cost_rating: 3,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201);
  });

  it('POST /venues/:id/reviews with valid data but an invalid auth token should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        star_rating: 5,
        cost_rating: 3,
      })
      .set('Authorization', `superDuperInvalid`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('POST /venues/:id/reviews with valid data but no auth token should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        star_rating: 5,
        cost_rating: 3,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('POST /venues/:id/reviews with valid data on a venue already reviewed should fail', async () => {
    await requestWithSupertest
      .post('/venues/708001fc65af4df19fcba9235c09f439/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        star_rating: 5,
        cost_rating: 3,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('POST /venues/:id/reviews with valid data on venue where you are the owner should fail', async () => {
    await requestWithSupertest
      .post('/venues/8b5db9ca7d6f41e398bf551230d7fc23/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        star_rating: 5,
        cost_rating: 3,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('POST /venues/:id/reviews with no content body should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues/:id/reviews with an empty review_body should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        review_body: '',
        star_rating: 5,
        cost_rating: 3,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues/:id/reviews with no review_body should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        star_rating: 5,
        cost_rating: 3,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues/:id/reviews with null star rating should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        star_rating: null,
        cost_rating: 3,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues/:id/reviews with no star rating should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        cost_rating: 3,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues/:id/reviews with less than 0 star rating should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        star_rating: -1,
        cost_rating: 3,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues/:id/reviews with greater than 5 star rating should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        star_rating: 6,
        cost_rating: 3,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues/:id/reviews with null cost rating should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        star_rating: 5,
        cost_rating: null,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues/:id/reviews with no cost rating should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        star_rating: 5,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues/:id/reviews with less than 0 cost rating should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        star_rating: 5,
        cost_rating: -1,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues/:id/reviews with greater than 5 cost rating should fail', async () => {
    await requestWithSupertest
      .post('/venues/b043f010284448e382d69571fae06808/reviews')
      .send({
        review_body: 'Pretty cold, very merry.',
        star_rating: 5,
        cost_rating: 6,
      })
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });
});
