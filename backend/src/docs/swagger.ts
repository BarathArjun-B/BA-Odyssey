import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'BA Odyssey API',
    version: '1.0.0',
    description: 'API documentation for BA Odyssey',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'username', 'email', 'password'],
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation error or user already exists' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User logged in successfully' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        responses: {
          200: { description: 'Token refreshed successfully' },
          401: { description: 'Invalid or missing refresh token' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout a user',
        responses: {
          200: { description: 'User logged out successfully' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile retrieved' },
          401: { description: 'Not authorized' },
        },
      },
    },
    '/api/v1/notes': {
      get: {
        tags: ['Notes'],
        summary: 'Get all notes for authenticated user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search query' },
          { name: 'tag', in: 'query', schema: { type: 'string' }, description: 'Filter by tag' },
        ],
        responses: {
          200: { description: 'Notes list retrieved' },
          401: { description: 'Not authorized' },
        },
      },
      post: {
        tags: ['Notes'],
        summary: 'Create a new note',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                  title: { type: 'string', maxLength: 200 },
                  content: { type: 'string', maxLength: 50000 },
                  tags: { type: 'array', items: { type: 'string' } },
                  isPinned: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Note created successfully' },
          400: { description: 'Validation error' },
          401: { description: 'Not authorized' },
        },
      },
    },
    '/api/v1/notes/{id}': {
      get: {
        tags: ['Notes'],
        summary: 'Get a note by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Note ID' },
        ],
        responses: {
          200: { description: 'Note retrieved successfully' },
          400: { description: 'Invalid ID format' },
          404: { description: 'Note not found' },
        },
      },
      put: {
        tags: ['Notes'],
        summary: 'Update an existing note',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Note ID' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', maxLength: 200 },
                  content: { type: 'string', maxLength: 50000 },
                  tags: { type: 'array', items: { type: 'string' } },
                  isPinned: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Note updated successfully' },
          400: { description: 'Validation error or invalid ID' },
          404: { description: 'Note not found' },
        },
      },
      delete: {
        tags: ['Notes'],
        summary: 'Delete a note',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Note ID' },
        ],
        responses: {
          200: { description: 'Note deleted successfully' },
          400: { description: 'Invalid ID format' },
          404: { description: 'Note not found' },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
