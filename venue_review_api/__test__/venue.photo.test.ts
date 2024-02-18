import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import supertest from 'supertest';
import * as db from '../src/config/db';
import server from '../src/config/express';
import * as storage from '../src/util/google_cloud_storage.helper';
import { bobby1_session_mock } from './mocks/session_mocks';
import { blackpanther_mock, bobby1_mock } from './mocks/user_mocks';

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
      } else if (sql.startsWith('SELECT user_id FROM Session')) {
        if (params[0] == hashedSessionToken) {
          return resolve([bobby1_session_mock]);
        }
      } else if (
        sql.startsWith(
          'SELECT is_primary, photo_filename FROM VenuePhoto WHERE',
        )
      ) {
        if (
          params[0] == '8b5db9ca7d6f41e398bf551230d7fc23' &&
          params[1] == '65d28077cb7021feecba9e75'
        ) {
          return resolve([
            { is_primary: 1, photo_filename: 'test-image-venue.png' },
          ]);
        }
      } else if (sql.startsWith('SELECT venue_id FROM VenuePhoto')) {
        if (
          params[0] == '8b5db9ca7d6f41e398bf551230d7fc23' &&
          params[1] == '65d28077cb7021feecba9e75'
        ) {
          return resolve([{ venue_id: '8b5db9ca7d6f41e398bf551230d7fc23' }]);
        }
      } else if (sql.startsWith('SELECT venue_id FROM Venue WHERE')) {
        if (
          params[0] == 'c48a5cfd48b94ac68787a3776d6ae78d' &&
          params[1] == '8b5db9ca7d6f41e398bf551230d7fc23'
        ) {
          return resolve([{ venue_id: '8b5db9ca7d6f41e398bf551230d7fc23' }]);
        }
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

afterAll(() => {
  // Clean up the dummy image file
  fs.unlinkSync(path.join(__dirname, './resources/test-image-venue.png'));
});

describe('Upload Venue Photo', () => {
  // Expanded for additional logging while I try debug some issues.
  it('POST /venues/:id/photo with valid session and data (is_primary = true) should succeed', async () => {
    try {
      const response = await requestWithSupertest
        .post('/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos')
        .set('Authorization', `${sessionToken}`)
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'photo',
          path.join(__dirname, './resources/test-image-venue.png'),
        )
        .field('description', 'This is an image')
        .field('is_primary', true);

      if (response.status !== 201) {
        console.error('Unexpected status code:', response.status);
        console.error('Response body:', response.body);
      }

      expect(response.status).toBe(201);
    } catch (error) {
      console.error('Test failed with error:', error);
      throw error;
    }
  });

  it('POST /venues/:id/photo with valid session and data (is_primary = false) should succeed', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos')
      .set('Authorization', `${sessionToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', path.join(__dirname, './resources/test-image-venue.png'))
      .field('description', 'This is an image')
      .field('is_primary', false)
      .expect('Content-Type', /json/)
      .expect(201);
  });

  it('POST /venues/:id/photo with valid session and valid data without is_primary should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos')
      .set('Authorization', `${sessionToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', path.join(__dirname, './resources/test-image-venue.png'))
      .field('description', 'This is an image')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /venues/:id/photo with valid session and valid data without description should succeed', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos')
      .set('Authorization', `${sessionToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', path.join(__dirname, './resources/test-image-venue.png'))
      .field('is_primary', false)
      .expect('Content-Type', /json/)
      .expect(201);
  });

  it('POST /venues/:id/photo with an invalid session and valid data should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos')
      .set('Authorization', `totallyInvalid`)
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', path.join(__dirname, './resources/test-image-venue.png'))
      .field('description', 'This is an image')
      .field('is_primary', false)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('POST /venues/:id/photo with no session and valid data should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos')
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', path.join(__dirname, './resources/test-image-venue.png'))
      .field('description', 'This is an image')
      .field('is_primary', false)
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('POST /venues/:id/photo with valid session and data but on an account where not admin should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .post('/venues/708001fc65af4df19fcba9235c09f439/photos')
      .set('Authorization', `${sessionToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', path.join(__dirname, './resources/test-image-venue.png'))
      .field('description', 'This is an image')
      .field('is_primary', false)
      .expect('Content-Type', /json/)
      .expect(403);
  });
});

describe('Set Venue Primary Photo', () => {
  it('POST /venues/:id/photos/:photoId/setPrimary with valid session and data should succeed', async () => {
    await requestWithSupertest
      .post(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/65d28077cb7021feecba9e75/setPrimary`,
      )
      .set('Authorization', `${sessionToken}`)
      .expect(200);
  });

  it('POST /venues/:id/photos/:photoId/setPrimary with valid session and data where image is already primary should succeed', async () => {
    await requestWithSupertest
      .post(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/65d28077cb7021feecba9e75/setPrimary`,
      )
      .set('Authorization', `${sessionToken}`)
      .expect(200);
  });

  it('POST /venues/:id/photos/:photoId/setPrimary with a valid image on an account where not admin should fail', async () => {
    await requestWithSupertest
      .post(
        `/venues/b043f010284448e382d69571fae06808/photos/testing1.png/setPrimary`,
      )
      .set('Authorization', `${sessionToken}`)
      .expect(403);
  });

  it('POST /venues/:id/photos/:photoId/setPrimary with valid session and invalid image should fail', async () => {
    await requestWithSupertest
      .post(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/superInvalid.png/setPrimary`,
      )
      .set('Authorization', `${sessionToken}`)
      .expect(404);
  });

  it('POST /venues/:id/photos/:photoId/setPrimary with invalid session and valid image should fail', async () => {
    await requestWithSupertest
      .post(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/65d28077cb7021feecba9e75/setPrimary`,
      )
      .set('Authorization', `superInvalid`)
      .expect(403);
  });

  it('POST /venues/:id/photos/:photoId/setPrimary with invalid session and valid image should fail', async () => {
    await requestWithSupertest
      .post(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/65d28077cb7021feecba9e75/setPrimary`,
      )
      .expect(401);
  });
});

describe('Remove Venue Photo', () => {
  it('DELETE /venues/:id/photos/:photoId with valid session and non primary photo should succeed', async () => {
    await requestWithSupertest
      .delete(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/65d28077cb7021feecba9e75`,
      )
      .set('Authorization', `${sessionToken}`)
      .expect(204);
  });

  it('DELETE /venues/:id/photos/:photoId with valid session and primary photo should succeed', async () => {
    await requestWithSupertest
      .delete(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/65d28077cb7021feecba9e75`,
      )
      .set('Authorization', `${sessionToken}`)
      .expect(204);
  });

  it('DELETE /venues/:id/photos/:photoId with a valid image on an account where not admin should fail', async () => {
    await requestWithSupertest
      .delete(
        `/venues/b043f010284448e382d69571fae06808/photos/65d28077cb7021feecba9e75`,
      )
      .set('Authorization', `${sessionToken}`)
      .expect(403);
  });

  it('DELETE /venues/:id/photos/:photoId with valid session and invalid image should fail', async () => {
    await requestWithSupertest
      .delete(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/superInvalid.png`,
      )
      .set('Authorization', `${sessionToken}`)
      .expect(404);
  });

  it('DELETE /venues/:id/photos/:photoId with invalid session and valid image should fail', async () => {
    await requestWithSupertest
      .delete(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/65d28077cb7021feecba9e75`,
      )
      .set('Authorization', `superInvalid`)
      .expect(403);
  });

  it('DELETE /venues/:id/photos/:photoId with invalid session and valid image should fail', async () => {
    await requestWithSupertest
      .delete(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/65d28077cb7021feecba9e75`,
      )
      .expect(401);
  });
});
