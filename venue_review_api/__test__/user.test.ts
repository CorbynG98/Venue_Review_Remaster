import fs from 'fs';
import path from 'path';
import supertest from 'supertest';
import { createPool } from '../src/config/db';
import server from '../src/config/express';

const requestWithSupertest = supertest(server);

// Safety fallback check for test ENV
if (process.env.NODE_ENV !== 'test') {
  throw new Error('ENVIRONMENT NOT SET TO TEST. FAILING WITH ERROR.');
}

beforeAll(async () => {
  await createPool();
  await authenticateUser();
});

let sessionToken: string = '';
const authenticateUser = async () => {
  const response = await requestWithSupertest
    .post('/auth/signin')
    .send({ username: 'bobby1', password: 'password' })
    .set('Accept', 'application/json');
  sessionToken = response.body.token;
};

describe('Update User', () => {});

describe('Upload Photo', () => {
  it('POST /users/photo with valid data should succeed', async () => {
    // Make sure file exists lol
    if (!fs.existsSync(path.join(__dirname, './resources/test-image.png'))) {
      throw new Error('File does not exist');
    }
    // Plonk it into the request
    const response = await requestWithSupertest
      .put('/users/photo')
      .set('Authorization', `${sessionToken}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', path.join(__dirname, './resources/test-image.png'))
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('message');
  });

  it('POST /users/photo with an invalid token should fail', async () => {
    // Make sure file exists lol
    if (!fs.existsSync(path.join(__dirname, './resources/test-image.png'))) {
      throw new Error('File does not exist');
    }
    // Plonk it into the request
    await requestWithSupertest
      .put('/users/photo')
      .set('Authorization', `totallyInvalid`)
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', path.join(__dirname, './resources/test-image.png'))
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('POST /users/photo with no token should fail', async () => {
    // Make sure file exists lol
    if (!fs.existsSync(path.join(__dirname, './resources/test-image.png'))) {
      throw new Error('File does not exist');
    }
    // Plonk it into the request
    await requestWithSupertest
      .put('/users/photo')
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', path.join(__dirname, './resources/test-image.png'))
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
