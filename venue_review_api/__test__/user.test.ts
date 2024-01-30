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
      if (sql.startsWith('SELECT user_id, password') || sql.startsWith('SELECT username, email')) {
        if (params[0] === 'black.panther' || params[0] == 'black.panther@super.heroes') {
          return resolve([blackpanther_mock])
        }
        if (params[0] === 'bobby1' || params[0] == 'bob.roberts@gmail.com' || params[0] == 'c48a5cfd48b94ac68787a3776d6ae78d') {
          return resolve([bobby1_mock])
        }
      }
      else if (sql.startsWith('SELECT user_id FROM Session')) {
        if (params[0] == hashedSessionToken) {
          return resolve([bobby1_session_mock])
        }
      }
      else if (sql.startsWith('SELECT profile_photo_filename FROM')) {
        if (params[0] == 'c48a5cfd48b94ac68787a3776d6ae78d') {
          return resolve([{ profile_photo_filename: 'testing.png' }])
        }
      }
      return resolve([]);
    });
  });
  // Create a dummy image file
  fs.writeFileSync(
    path.join(__dirname, './resources/test-image-user.png'),
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
  fs.unlinkSync(path.join(__dirname, './resources/test-image-user.png'));
});

describe('Update User', () => {
  it('PATCH /users with valid session and data should succeed', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: 'bobby1',
        email: 'bob.roberts@gmail.com',
        given_name: 'Bobby',
        family_name: 'Robbers',
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('PATCH /users with valid session and empty username should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: '',
        email: 'bob.roberts@gmail.com',
        given_name: 'Bobby',
        family_name: 'Robbers',
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /users with valid session and no username should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        email: 'bob.roberts@gmail.com',
        given_name: 'Bobby',
        family_name: 'Robbers',
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /users with valid session and invalid email should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: 'bobby1',
        email: 'bob.roberts.invalid.com',
        given_name: 'Bobby',
        family_name: 'Robbers',
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /users with valid session and empty email should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: 'bobby1',
        email: '',
        given_name: 'Bobby',
        family_name: 'Robbers',
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /users with valid session and no email should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: 'bobby1',
        given_name: 'Bobby',
        family_name: 'Robbers',
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /users with valid session and empty given_name should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: 'bobby1',
        email: 'bob.roberts@gmail.com',
        given_name: '',
        family_name: 'Robbers',
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /users with valid session and no given_name should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: 'bobby1',
        email: 'bob.roberts@gmail.com',
        family_name: 'Robbers',
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /users with valid session and empty family_name should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: 'bobby1',
        email: 'bob.roberts@gmail.com',
        given_name: 'Bobby',
        family_name: '',
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /users with valid session and no family_name should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: 'bobby1',
        email: 'bob.roberts@gmail.com',
        given_name: 'Bobby',
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /users with valid session and username that already exists should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: 'black.panther',
        email: 'bob.roberts.new@gmail.com',
        given_name: 'Bobby',
        family_name: 'Robbers',
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /users with valid session and email that already exists should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: 'bobby1new',
        email: 'black.panther@super.heroes',
        given_name: 'Bobby',
        family_name: 'Robbers',
      })
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('PATCH /users with valid data and an invalid session should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: 'bobby1',
        email: 'bob.roberts@gmail.com',
        given_name: 'Bobby',
        family_name: 'Robbers',
      })
      .set('Authorization', `superInvalid`)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('PATCH /users with valid data and no session should fail', async () => {
    // Plonk it into the request
    await requestWithSupertest
      .patch('/users')
      .send({
        username: 'bobby1',
        email: 'bob.roberts@gmail.com',
        given_name: 'Bobby',
        family_name: 'Robbers',
      })
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('Upload Photo', () => {
  it('POST /users/photo with valid data should succeed', async () => {
    // Make sure file exists lol
    if (
      !fs.existsSync(path.join(__dirname, './resources/test-image-user.png'))
    ) {
      throw new Error('File does not exist');
    }
    // Plonk it into the request
    const response = await requestWithSupertest
      .put('/users/photo')
      .set('Authorization', `${sessionToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', path.join(__dirname, './resources/test-image-user.png'))
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('message');
  });

  it('POST /users/photo with an invalid token should fail', async () => {
    // Make sure file exists lol
    if (
      !fs.existsSync(path.join(__dirname, './resources/test-image-user.png'))
    ) {
      throw new Error('File does not exist');
    }
    // Plonk it into the request
    await requestWithSupertest
      .put('/users/photo')
      .set('Authorization', `totallyInvalid`)
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', path.join(__dirname, './resources/test-image-user.png'))
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('POST /users/photo with no token should fail', async () => {
    // Make sure file exists lol
    if (
      !fs.existsSync(path.join(__dirname, './resources/test-image-user.png'))
    ) {
      throw new Error('File does not exist');
    }
    // Plonk it into the request
    await requestWithSupertest
      .put('/users/photo')
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', path.join(__dirname, './resources/test-image-user.png'))
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('POST /users/photo without an image should fail', async () => {
    await requestWithSupertest
      .put('/users/photo')
      .set('Authorization', `${sessionToken}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });
});

describe('Remove Photo', () => {
  it('DELETE /users/photo with valid data should succeed', async () => {
    await requestWithSupertest
      .delete('/users/photo')
      .set('Authorization', `${sessionToken}`)
      .expect(204);
  });

  it('DELETE /users/photo with an invalid token should fail', async () => {
    await requestWithSupertest
      .delete('/users/photo')
      .set('Authorization', `totallyInvalid`)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('DELETE /users/photo with no token should fail', async () => {
    await requestWithSupertest
      .delete('/users/photo')
      .expect('Content-Type', /json/)
      .expect(401);
  });
});
