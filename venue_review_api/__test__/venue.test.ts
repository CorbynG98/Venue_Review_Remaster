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
        expect(response.body[0].distance).toBeGreaterThanOrEqual(
            response.body[response.body.length - 1].distance,
        );
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
        expect(response.body[0].distance).toBeLessThanOrEqual(
            response.body[response.body.length - 1].distance,
        );
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
        expect(Number(response.body[0].avg_star_rating)).toBeGreaterThanOrEqual(
            Number(response.body[response.body.length - 1].avg_star_rating),
        );
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
        expect(Number(response.body[0].avg_star_rating)).toBeLessThanOrEqual(
            Number(response.body[response.body.length - 1].avg_star_rating),
        );
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
        expect(Number(response.body[0].avg_cost_rating)).toBeGreaterThanOrEqual(
            Number(response.body[response.body.length - 1].avg_cost_rating),
        );
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
        expect(Number(response.body[0].avg_cost_rating)).toBeLessThanOrEqual(
            Number(response.body[response.body.length - 1].avg_cost_rating),
        );
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
