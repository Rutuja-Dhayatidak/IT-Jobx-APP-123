const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Mocking application submit endpoint matching Schema rules
app.post('/api/applications/apply', (req, res) => {
  const { jobId, resumeUrl, coverLetter } = req.body;
  if (!jobId || !resumeUrl) {
    return res.status(400).json({ success: false, message: 'jobId and resumeUrl are required' });
  }
  // Check format of jobId (Mongoose ObjectId validation simulation)
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(jobId);
  if (!isObjectId) {
    return res.status(400).json({ success: false, message: 'Invalid jobId' });
  }
  res.json({ success: true, message: 'Application submitted successfully', applicationId: 'mock-app-123' });
});

describe('POST /api/applications/apply Integration Tests', () => {
  it('should fail if jobId or resumeUrl is missing', async () => {
    const res = await request(app)
      .post('/api/applications/apply')
      .send({ coverLetter: 'Test cover letter content' });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('required');
  });

  it('should fail if jobId is not a valid 24-character hexadecimal ObjectId', async () => {
    const res = await request(app)
      .post('/api/applications/apply')
      .send({ jobId: 'invalid_id_123', resumeUrl: 'https://test.com/res.pdf' });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid jobId');
  });

  it('should submit successfully with valid inputs', async () => {
    const res = await request(app)
      .post('/api/applications/apply')
      .send({ 
        jobId: '60c72b2f9b1d8a0015f8e81d', 
        resumeUrl: 'https://test.com/resume.pdf',
        coverLetter: 'Test cover letter content' 
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.applicationId).toEqual('mock-app-123');
  });
});
