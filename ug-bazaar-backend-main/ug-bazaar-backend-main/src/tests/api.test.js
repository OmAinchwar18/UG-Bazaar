const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

// Mock Mongoose connection methods to prevent timeout issues during CI/CD or local test runs
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      ...actualMongoose.connection,
      readyState: 1,
      close: jest.fn().mockResolvedValue(true),
    }
  };
});

// Mock the Product Model to return structured catalog results without querying MongoDB
jest.mock('../models/Product', () => {
  const mockQuery = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockImplementation(() => Promise.resolve([])),
    then: jest.fn().mockImplementation((resolve) => resolve([])),
  };
  return {
    find: jest.fn().mockReturnValue(mockQuery),
    countDocuments: jest.fn().mockResolvedValue(0),
  };
});

describe('UG Bazaar Integration API Tests', () => {
  
  beforeAll(async () => {
    // Mocks will prevent real network attempts
    await mongoose.connect('mongodb://mocked-uri/ugbazaar_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /', () => {
    it('should return successfully with API running status', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('UG Bazaar API running');
    });
  });

  describe('Auth Endpoints validation', () => {
    it('should fail registration when name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          mobile: '9999999999',
          password: 'password123'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Naam daalna zaroori hai');
    });

    it('should fail login when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          mobile: '9999999999'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Password daalo');
    });
  });

  describe('Product Retrieval Catalog', () => {
    it('should fetch active catalog list', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
    });
  });

});
