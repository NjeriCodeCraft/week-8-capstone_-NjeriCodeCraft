const request = require('supertest');
const app = require('../index'); // Adjust this path if your app entry point is different

describe('API Endpoints', () => {
  it('should return 404 for a non-existent route', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');
    expect(res.statusCode).toEqual(404);
  });
}); 