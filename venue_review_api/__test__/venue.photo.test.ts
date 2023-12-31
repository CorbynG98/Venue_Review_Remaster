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

let sessionToken: string = '';
beforeAll(async () => {
  await createPool();
  // Configure session
  sessionToken = await authenticateUser();
  // Create a dummy image file
  fs.writeFileSync(
    path.join(__dirname, './resources/test-image-venue.png'),
    'mock content',
  );
});

afterAll(() => {
  // Clean up the dummy image file
  fs.unlinkSync(path.join(__dirname, './resources/test-image-venue.png'));
});

const authenticateUser = async () => {
  const response = await requestWithSupertest
    .post('/auth/signin')
    .send({ username: 'bobby1', password: 'password' })
    .set('Accept', 'application/json');
  return response.body.token;
};

const uploadImageAndGetResult = async (
  customSession: string,
  venueId: string,
  makePrimary: boolean,
) => {
  // Plonk it into the request
  let response = await requestWithSupertest
    .post(`/venues/${venueId}/photos`)
    .set('Authorization', `${customSession}`)
    .set('Content-Type', 'multipart/form-data')
    .attach('photo', path.join(__dirname, './resources/test-image-venue.png'))
    .field('description', 'This is an image')
    .field('is_primary', makePrimary)
    .expect('Content-Type', /json/)
    .expect(201);

  return response.body.message; // Should be the URL of the image.
};

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
    // Upload an image and get the URL
    let imageURL = await uploadImageAndGetResult(
      sessionToken,
      '8b5db9ca7d6f41e398bf551230d7fc23',
      false,
    );
    await requestWithSupertest
      .post(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/${imageURL}/setPrimary`,
      )
      .set('Authorization', `${sessionToken}`)
      .expect(200);
  });

  it('POST /venues/:id/photos/:photoId/setPrimary with valid session and data where image is already primary should succeed', async () => {
    // Upload an image and get the URL
    let imageURL = await uploadImageAndGetResult(
      sessionToken,
      '8b5db9ca7d6f41e398bf551230d7fc23',
      true,
    );
    await requestWithSupertest
      .post(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/${imageURL}/setPrimary`,
      )
      .set('Authorization', `${sessionToken}`)
      .expect(200);
  });

  it('POST /venues/:id/photos/:photoId/setPrimary with valid session and data where image is already primary should succeed', async () => {
    // Upload an image and get the URL
    let imageURL = await uploadImageAndGetResult(
      sessionToken,
      '8b5db9ca7d6f41e398bf551230d7fc23',
      true,
    );
    await requestWithSupertest
      .post(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/${imageURL}/setPrimary`,
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
    // Upload an image and get the URL
    let imageURL = await uploadImageAndGetResult(
      sessionToken,
      '8b5db9ca7d6f41e398bf551230d7fc23',
      true,
    );
    await requestWithSupertest
      .post(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/${imageURL}/setPrimary`,
      )
      .set('Authorization', `superInvalid`)
      .expect(403);
  });

  it('POST /venues/:id/photos/:photoId/setPrimary with invalid session and valid image should fail', async () => {
    // Upload an image and get the URL
    let imageURL = await uploadImageAndGetResult(
      sessionToken,
      '8b5db9ca7d6f41e398bf551230d7fc23',
      true,
    );
    await requestWithSupertest
      .post(
        `/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/${imageURL}/setPrimary`,
      )
      .expect(401);
  });
});

describe('Remove Venue Photo', () => {
  it('DELETE /venues/:id/photos/:photoId with valid session and non primary photo should succeed', async () => {
    // Upload an image and get the URL
    let imageURL = await uploadImageAndGetResult(
      sessionToken,
      '8b5db9ca7d6f41e398bf551230d7fc23',
      false,
    );
    await requestWithSupertest
      .delete(`/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/${imageURL}`)
      .set('Authorization', `${sessionToken}`)
      .expect(204);
  });

  it('DELETE /venues/:id/photos/:photoId with valid session and primary photo should succeed', async () => {
    // Upload an image and get the URL
    let imageURL = await uploadImageAndGetResult(
      sessionToken,
      '8b5db9ca7d6f41e398bf551230d7fc23',
      true,
    );
    await requestWithSupertest
      .delete(`/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/${imageURL}`)
      .set('Authorization', `${sessionToken}`)
      .expect(204);
  });

  it('DELETE /venues/:id/photos/:photoId with a valid image on an account where not admin should fail', async () => {
    await requestWithSupertest
      .delete(`/venues/b043f010284448e382d69571fae06808/photos/testing1.png`)
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
    // Upload an image and get the URL
    let imageURL = await uploadImageAndGetResult(
      sessionToken,
      '8b5db9ca7d6f41e398bf551230d7fc23',
      true,
    );
    await requestWithSupertest
      .delete(`/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/${imageURL}`)
      .set('Authorization', `superInvalid`)
      .expect(403);
  });

  it('DELETE /venues/:id/photos/:photoId with invalid session and valid image should fail', async () => {
    // Upload an image and get the URL
    let imageURL = await uploadImageAndGetResult(
      sessionToken,
      '8b5db9ca7d6f41e398bf551230d7fc23',
      true,
    );
    await requestWithSupertest
      .delete(`/venues/8b5db9ca7d6f41e398bf551230d7fc23/photos/${imageURL}`)
      .expect(401);
  });
});
