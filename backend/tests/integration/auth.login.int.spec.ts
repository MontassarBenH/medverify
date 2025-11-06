import request from 'supertest';
import app from '../../src/server';

describe('POST /auth/login (integration)', () => {
  beforeAll(async () => {
    await request(app).post('/dev/seed');
  });

  it('liefert 200 + token bei korrekten Credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'apo@demo.local', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.role).toBe('APOTHEKER');
  });

  it('liefert 401 bei falschem Passwort', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'apo@demo.local', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});
