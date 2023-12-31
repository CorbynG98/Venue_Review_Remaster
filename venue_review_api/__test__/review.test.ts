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

var sessionToken: string = '';
const authenticateUser = async () => {
    const response = await requestWithSupertest
        .post('/auth/signin')
        .send({ username: 'bobby1', password: 'password' })
        .set('Accept', 'application/json');
    sessionToken = response.body.token;
};

describe('Get Reviews', () => {
    it('GET /venues/:id/reviews with a valid id should succeed', async () => {
        const response = await requestWithSupertest
            .get('/venues/8b5db9ca7d6f41e398bf551230d7fc23/reviews')
            .expect(200);

        expect(response.body.length).toBeGreaterThanOrEqual(2);
        expect(response.body[0]).toHaveProperty('review_author');
        expect(response.body[0].review_author).toHaveProperty('user_id');
        expect(response.body[0].review_author).toHaveProperty('username');
        expect(response.body[0]).toHaveProperty('review_body');
        expect(response.body[0]).toHaveProperty('cost_rating');
        expect(response.body[0]).toHaveProperty('star_rating');
        expect(response.body[0]).toHaveProperty('time_posted');
    });

    it('GET /venues/:id/reviews with an invalid id should fail', async () => {
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
