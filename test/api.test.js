const request = require('supertest');
const app = require('../server'); // Assuming server.js exports the app.

let token;

beforeAll(async () => {
  // Register a test user
  await request(app)
    .post('/api/auth/register')
    .send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      isSeller: false
    });

  // Login the test user
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'testuser@example.com',
      password: 'password123'
    });

  token = loginResponse.body.token; // Save the token for authorization
});

describe('Auth API Tests', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'newpassword123',
        isSeller: true
      });
    expect(response.statusCode).toBe(201);
  });

  it('should login the user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'newuser@example.com',
        password: 'newpassword123'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should get authenticated user data', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('user');
  });
});

describe('Gig API Tests', () => {
  it('should get all gigs', async () => {
    const response = await request(app)
      .get('/api/gigs');
    expect(response.statusCode).toBe(200);
  });

  // More Gig API tests can be added here...
});

describe('Order API Tests', () => {
  it('should create a new order', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ gigId: 'exampleGigId' });
    expect(response.statusCode).toBe(201);
  });

  // More Order API tests can be added here...
});
