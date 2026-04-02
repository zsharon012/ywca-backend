const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'YWCA Backend API',
      version: '1.0.0',
      description: 'API documentation for YWCA backend services including authentication, contacts, templates, and email management.',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development Server',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            uid: { type: 'string', description: 'User ID' },
            email: { type: 'string', description: 'User email' },
            name: { type: 'string', description: 'User name' },
          },
        },
        Recipient: {
          type: 'object',
          properties: {
            recipientid: { type: 'string', description: 'Recipient ID' },
            recipientfirstname: { type: 'string' },
            recipientlastname: { type: 'string' },
            recipientemail: { type: 'string' },
            recipientphonenumber: { type: 'string' },
          },
        },
        Template: {
          type: 'object',
          properties: {
            templateid: { type: 'string' },
            name: { type: 'string' },
            subject: { type: 'string' },
            body: { type: 'string' },
            createdby: { type: 'string' },
            createdon: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/server.js'],
};

export default swaggerOptions;
