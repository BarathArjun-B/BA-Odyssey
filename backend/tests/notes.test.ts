import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/User';
import { Note } from '../src/models/Note';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/ba_odyssey_test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Note.deleteMany({});
  await User.deleteMany({});
});

describe('Notes API (/api/v1/notes)', () => {
  const userAData = {
    firstName: 'User',
    lastName: 'Alpha',
    username: 'user_alpha',
    email: 'alpha@example.com',
    password: 'Password123!',
  };

  const userBData = {
    firstName: 'User',
    lastName: 'Beta',
    username: 'user_beta',
    email: 'beta@example.com',
    password: 'Password123!',
  };

  let tokenA: string;
  let tokenB: string;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app).post('/api/v1/auth/register').send(userAData);
    tokenA = resA.body.data.accessToken;

    // Register User B
    const resB = await request(app).post('/api/v1/auth/register').send(userBData);
    tokenB = resB.body.data.accessToken;
  });

  describe('Authentication & Authorization', () => {
    it('should reject requests without a token with 401', async () => {
      const res = await request(app).get('/api/v1/notes');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject requests with an invalid token with 401', async () => {
      const res = await request(app)
        .get('/api/v1/notes')
        .set('Authorization', 'Bearer invalid.jwt.token');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/notes (Create Note)', () => {
    it('should create a valid note for authenticated user', async () => {
      const payload = {
        title: 'Founder Psychology',
        content: 'Focus on high agency and talking to users daily.',
        tags: ['Mindset', 'Growth', 'Mindset '], // duplicate & mixed case
        isPinned: true,
      };

      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note).toHaveProperty('_id');
      expect(res.body.data.note.title).toBe(payload.title);
      expect(res.body.data.note.content).toBe(payload.content);
      expect(res.body.data.note.isPinned).toBe(true);
      // Normalized and deduplicated tags
      expect(res.body.data.note.tags).toEqual(['mindset', 'growth']);
      expect(res.body.data.note).toHaveProperty('createdAt');
      expect(res.body.data.note).toHaveProperty('updatedAt');
    });

    it('should reject note creation with missing title', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ content: 'Missing title note' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject note creation with missing content', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Missing content title' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject note creation when title exceeds 200 characters', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'A'.repeat(201),
          content: 'Valid content',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should prevent mass assignment of userId and timestamps', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      const fakeCreatedAt = '2020-01-01T00:00:00.000Z';

      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Protected fields test',
          content: 'Trying to inject userId',
          userId: fakeUserId.toString(),
          createdAt: fakeCreatedAt,
        });

      expect(res.status).toBe(201);
      // Verify userId was NOT overwritten with fakeUserId
      expect(res.body.data.note.userId).not.toBe(fakeUserId.toString());
      expect(res.body.data.note.createdAt).not.toBe(fakeCreatedAt);
    });
  });

  describe('GET /api/v1/notes (List, Search & Tag Filter)', () => {
    beforeEach(async () => {
      // Create notes for User A
      await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Unpinned Alpha Note', content: 'Random content alpha', tags: ['strategy'], isPinned: false });

      await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Pinned Alpha Note', content: 'Important customer feedback', tags: ['customer', 'strategy'], isPinned: true });

      await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Stripe Case Study', content: 'Collison 7 lines of code', tags: ['case-study'], isPinned: false });

      // Create a note for User B (to test cross-user isolation)
      await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'Beta Secret Note', content: 'Secret beta content', tags: ['strategy'], isPinned: true });
    });

    it('should list all notes for User A ordered with pinned first', async () => {
      const res = await request(app)
        .get('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notes.length).toBe(3);
      // First note must be pinned
      expect(res.body.data.notes[0].isPinned).toBe(true);
      expect(res.body.data.notes[0].title).toBe('Pinned Alpha Note');
    });

    it('should search notes by title query', async () => {
      const res = await request(app)
        .get('/api/v1/notes?q=Stripe')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes.length).toBe(1);
      expect(res.body.data.notes[0].title).toBe('Stripe Case Study');
    });

    it('should search notes by content query', async () => {
      const res = await request(app)
        .get('/api/v1/notes?q=Collison')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes.length).toBe(1);
      expect(res.body.data.notes[0].title).toBe('Stripe Case Study');
    });

    it('should safely escape regex special characters in search query', async () => {
      const res = await request(app)
        .get('/api/v1/notes?q=(.*+?^)')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes.length).toBe(0);
    });

    it('should filter notes by tag', async () => {
      const res = await request(app)
        .get('/api/v1/notes?tag=case-study')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes.length).toBe(1);
      expect(res.body.data.notes[0].title).toBe('Stripe Case Study');
    });

    it('should isolate User B notes from User A list and search', async () => {
      // User A searching for 'Beta' should return 0 results
      const res = await request(app)
        .get('/api/v1/notes?q=Beta')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes.length).toBe(0);
    });
  });

  describe('GET /api/v1/notes/:id (Get Single Note)', () => {
    let noteAId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Single Note', content: 'Single note body' });
      noteAId = res.body.data.note._id;
    });

    it('should retrieve note by valid ID', async () => {
      const res = await request(app)
        .get(`/api/v1/notes/${noteAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note._id).toBe(noteAId);
    });

    it('should return 400 for malformed ObjectId', async () => {
      const res = await request(app)
        .get('/api/v1/notes/invalid-id-format')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_ID');
    });

    it('should return 404 when User B attempts to access User A note', async () => {
      const res = await request(app)
        .get(`/api/v1/notes/${noteAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/v1/notes/:id (Update Note)', () => {
    let noteAId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Original Title', content: 'Original Content', isPinned: false });
      noteAId = res.body.data.note._id;
    });

    it('should update note title, content, tags, and pin status', async () => {
      const res = await request(app)
        .put(`/api/v1/notes/${noteAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Updated Title',
          content: 'Updated Content',
          tags: ['Updated', 'Tag'],
          isPinned: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note.title).toBe('Updated Title');
      expect(res.body.data.note.content).toBe('Updated Content');
      expect(res.body.data.note.tags).toEqual(['updated', 'tag']);
      expect(res.body.data.note.isPinned).toBe(true);
    });

    it('should return 404 when User B tries to update User A note', async () => {
      const res = await request(app)
        .put(`/api/v1/notes/${noteAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/v1/notes/:id (Delete Note)', () => {
    let noteAId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Note to Delete', content: 'Will be deleted' });
      noteAId = res.body.data.note._id;
    });

    it('should delete existing note for owner', async () => {
      const res = await request(app)
        .delete(`/api/v1/notes/${noteAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify note is gone
      const checkRes = await request(app)
        .get(`/api/v1/notes/${noteAId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.status).toBe(404);
    });

    it('should return 404 when User B tries to delete User A note', async () => {
      const res = await request(app)
        .delete(`/api/v1/notes/${noteAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');

      // Verify User A note still exists
      const checkRes = await request(app)
        .get(`/api/v1/notes/${noteAId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(checkRes.status).toBe(200);
    });
  });
});
