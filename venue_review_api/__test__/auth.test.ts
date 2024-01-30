import crypto from 'crypto';
import supertest from 'supertest';
import * as db from '../src/config/db';
import server from '../src/config/express';
// Import mocks from user_mocks.ts file
import { bobby1_mock } from './mocks//user_mocks';
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
      if (sql.startsWith('SELECT user_id, password')) {
        if (params[0] === 'bobby1' || params[0] == 'bob.roberts@gmail.com') {
          return resolve([bobby1_mock])
        }
      }
      else if (sql.startsWith('SELECT user_id FROM Session')) {
        if (params[0] == hashedSessionToken) {
          return resolve([bobby1_session_mock])
        }
      }
      else if (sql.startsWith('DELETE FROM Session')) {
        if (params[0] == hashedSessionToken) {
          return resolve([])
        }
      }
      return resolve([]);
    });
  });
});

describe('User Signin', () => {
  it('POST /auth/signin with valid data (USERNAME VARIANT) should return 200 with token', async () => {
    const response = await requestWithSupertest
      .post('/auth/signin')
      .send({ username: 'bobby1', password: 'password' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('token');
  });

  it('POST /auth/signin with valid data (EMAIL VARIANT) should return 200 with token', async () => {
    const response = await requestWithSupertest
      .post('/auth/signin')
      .send({ username: 'bob.roberts@gmail.com', password: 'password' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('token');
  });

  it('POST /auth/signin with valid username and invalid password should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signin')
      .send({ username: 'bobby1', password: 'totallyInvalid' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('POST /auth/signin with valid email and invalid password should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signin')
      .send({ username: 'bob.roberts@gmail.com', password: 'totallyInvalid' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('POST /auth/signin with invalid username and valid password should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signin')
      .send({ username: 'test999', password: 'password' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('POST /auth/signin with no username should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signin')
      .send({ username: '', password: 'password' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /auth/signin with no password should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signin')
      .send({ username: 'test1', password: '' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /auth/signin with no username and no password should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signin')
      .send({ username: '', password: '' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });
});

describe('User Signup', () => {
  it('POST /auth/signup with valid data should return 201 with token', async () => {
    const response = await requestWithSupertest
      .post('/auth/signup')
      .send({
        username: 'testCreate',
        email: 'testCreate@email.com',
        givenName: 'Test',
        familyName: 'Create',
        password: 'password',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('token');
  });

  it('POST /auth/signup with too short password should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signup')
      .send({
        username: 'bobby1',
        email: 'testCreate@email.com',
        givenName: 'Test',
        familyName: 'Create',
        password: '1234',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /auth/signup with existing username should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signup')
      .send({
        username: 'bobby1',
        email: 'testCreate@email.com',
        givenName: 'Test',
        familyName: 'Create',
        password: 'password',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /auth/signup with no username should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signup')
      .send({
        username: '',
        email: 'testCreate@email.com',
        givenName: 'Test',
        familyName: 'Create',
        password: 'password',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /auth/signup with no password should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signup')
      .send({
        username: 'test999',
        email: 'testCreate@email.com',
        givenName: 'Test',
        familyName: 'Create',
        password: '',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /auth/signup with no family name should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signup')
      .send({
        username: 'test999',
        email: 'testCreate@email.com',
        givenName: 'Test',
        familyName: '',
        password: 'password',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /auth/signup with no given name should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signup')
      .send({
        username: 'test999',
        email: 'testCreate@email.com',
        givenName: '',
        familyName: 'Create',
        password: 'password',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /auth/signup with no email should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signup')
      .send({
        username: 'test999',
        email: '',
        givenName: 'Test',
        familyName: 'Create',
        password: 'password',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('POST /auth/signup with no username and no password should return 400', async () => {
    await requestWithSupertest
      .post('/auth/signup')
      .send({ username: '', password: '' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });
});

describe('User Signout', () => {
  it('POST /auth/signout with a valid session should succeed', async () => {
    await requestWithSupertest
      .post('/auth/signout')
      .set('Authorization', `${sessionToken}`)
      .set('Accept', 'application/json')
      .expect(204);
  });

  it('POST /auth/signout with an invalid session should fail', async () => {
    await requestWithSupertest
      .post('/auth/signout')
      .set('Accept', 'application/json')
      .set('Authorization', `superInvalidToken`)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('POST /auth/signout with no token should return 401', async () => {
    await requestWithSupertest
      .post('/auth/signout')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });
});
