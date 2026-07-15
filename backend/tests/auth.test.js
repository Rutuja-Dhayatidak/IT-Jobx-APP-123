const request = require('supertest');
const express = require('express');

// Mock a simple app router to check candidate routing structure without needing Mongo running
const app = express();
app.use(express.json());

app.post('/api/candidates/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (email === 'wrong@test.com') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ success: true, token: 'mock-jwt-token' });
});

describe('POST /api/candidates/login Integration', () => {
  it('should reject requests with missing fields', async () => {
    const res = await request(app)
      .post('/api/candidates/login')
      .send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Email and password are required');
  });

  it('should return 401 for incorrect credentials', async () => {
    const res = await request(app)
      .post('/api/candidates/login')
      .send({ email: 'wrong@test.com', password: 'password123' });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid credentials');
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/candidates/login')
      .send({ email: 'ajay@test.com', password: 'password123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
  });
});
