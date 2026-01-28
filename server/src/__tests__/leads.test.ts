import request from 'supertest';
import app from '../app';
import Lead from '../models/Lead';

describe('Lead Management API', () => {
  describe('POST /api/leads', () => {
    it('should create a new lead with valid data', async () => {
      const leadData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        vehicleInfo: 'Toyota Camry 2020',
        damageDescription: 'Front bumper damage',
        preferredContactMethod: 'email'
      };

      const response = await request(app)
        .post('/api/leads')
        .send(leadData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('submitted');
      expect(response.body.lead.name).toBe('John Doe');
      expect(response.body.lead.status).toBe('new');

      // Verify lead was created in database
      const lead = await Lead.findOne({ email: 'john@example.com' });
      expect(lead).toBeDefined();
      expect(lead?.name).toBe('John Doe');
    });

    it('should reject lead with missing required fields', async () => {
      const response = await request(app)
        .post('/api/leads')
        .send({
          name: 'John Doe',
          // Missing email, phone, etc.
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject lead with invalid email', async () => {
      const response = await request(app)
        .post('/api/leads')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          phone: '1234567890',
          vehicleInfo: 'Toyota Camry 2020',
          damageDescription: 'Front bumper damage'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should detect honeypot spam', async () => {
      const response = await request(app)
        .post('/api/leads')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          vehicleInfo: 'Toyota Camry 2020',
          damageDescription: 'Front bumper damage',
          website: 'http://spam.com' // Honeypot field
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('spam');
    });
  });

  describe('GET /api/admin/leads', () => {
    beforeEach(async () => {
      // Create test leads
      await Lead.create([
        {
          name: 'Lead 1',
          email: 'lead1@example.com',
          phone: '1111111111',
          vehicleInfo: 'Honda Civic 2020',
          damageDescription: 'Minor scratch',
          status: 'new',
          repairStage: 'pending'
        },
        {
          name: 'Lead 2',
          email: 'lead2@example.com',
          phone: '2222222222',
          vehicleInfo: 'Ford F-150 2019',
          damageDescription: 'Dent on door',
          status: 'contacted',
          repairStage: 'in_progress'
        },
        {
          name: 'Lead 3',
          email: 'lead3@example.com',
          phone: '3333333333',
          vehicleInfo: 'Tesla Model 3 2021',
          damageDescription: 'Paint damage',
          status: 'converted',
          repairStage: 'completed'
        }
      ]);
    });

    it('should retrieve paginated leads', async () => {
      const response = await request(app)
        .get('/api/admin/leads?page=1&limit=2')
        .set('x-api-key', process.env.ADMIN_API_KEY || 'test-key')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.leads).toHaveLength(2);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should filter leads by status', async () => {
      const response = await request(app)
        .get('/api/admin/leads?status=new')
        .set('x-api-key', process.env.ADMIN_API_KEY || 'test-key')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.leads).toHaveLength(1);
      expect(response.body.leads[0].status).toBe('new');
    });

    it('should filter leads by repair stage', async () => {
      const response = await request(app)
        .get('/api/admin/leads?repairStage=completed')
        .set('x-api-key', process.env.ADMIN_API_KEY || 'test-key')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.leads).toHaveLength(1);
      expect(response.body.leads[0].repairStage).toBe('completed');
    });

    it('should search leads by name', async () => {
      const response = await request(app)
        .get('/api/admin/leads?search=Lead%201')
        .set('x-api-key', process.env.ADMIN_API_KEY || 'test-key')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.leads.length).toBeGreaterThan(0);
      expect(response.body.leads[0].name).toContain('Lead 1');
    });

    it('should reject request without API key', async () => {
      const response = await request(app)
        .get('/api/admin/leads')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/admin/leads/:id/status', () => {
    it('should update lead status', async () => {
      const lead = await Lead.create({
        name: 'Test Lead',
        email: 'test@example.com',
        phone: '1234567890',
        vehicleInfo: 'Toyota Camry 2020',
        damageDescription: 'Front damage',
        status: 'new'
      });

      const response = await request(app)
        .patch(`/api/admin/leads/${lead._id}/status`)
        .set('x-api-key', process.env.ADMIN_API_KEY || 'test-key')
        .send({
          status: 'contacted',
          repairStage: 'in_progress'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.lead.status).toBe('contacted');
      expect(response.body.lead.repairStage).toBe('in_progress');
    });

    it('should reject invalid status', async () => {
      const lead = await Lead.create({
        name: 'Test Lead',
        email: 'test@example.com',
        phone: '1234567890',
        vehicleInfo: 'Toyota Camry 2020',
        damageDescription: 'Front damage',
        status: 'new'
      });

      const response = await request(app)
        .patch(`/api/admin/leads/${lead._id}/status`)
        .set('x-api-key', process.env.ADMIN_API_KEY || 'test-key')
        .send({
          status: 'invalid_status'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
