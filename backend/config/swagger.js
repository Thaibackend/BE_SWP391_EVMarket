const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Electric Vehicle Marketplace API',
            version: '1.0.0',
            description: 'API documentation for Electric Vehicle Marketplace platform',
            contact: {
                name: 'API Support',
                email: 'support@evmarketplace.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://api.evmarketplace.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        userId: { type: 'integer' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                        fullName: { type: 'string' },
                        avatarUrl: { type: 'string' },
                        role: { type: 'string', enum: ['Member', 'Admin'] },
                        status: { type: 'string', enum: ['Active', 'Inactive', 'Suspended'] },
                        createdDate: { type: 'string', format: 'date-time' }
                    }
                },
                Brand: {
                    type: 'object',
                    properties: {
                        brandId: { type: 'integer' },
                        brandName: { type: 'string' }
                    }
                },
                Car: {
                    type: 'object',
                    properties: {
                        carId: { type: 'integer' },
                        brandId: { type: 'integer' },
                        model: { type: 'string' },
                        year: { type: 'integer' },
                        batteryCapacity: { type: 'number' },
                        kilometers: { type: 'integer' },
                        description: { type: 'string' },
                        status: { type: 'string' }
                    }
                },
                Pin: {
                    type: 'object',
                    properties: {
                        pinId: { type: 'integer' },
                        brandId: { type: 'integer' },
                        capacity: { type: 'number' },
                        model: { type: 'string' },
                        status: { type: 'string' },
                        manufactureYear: { type: 'integer' },
                        description: { type: 'string' }
                    }
                },
                Listing: {
                    type: 'object',
                    properties: {
                        listingId: { type: 'integer' },
                        userId: { type: 'integer' },
                        carId: { type: 'integer', nullable: true },
                        pinId: { type: 'integer', nullable: true },
                        listingType: { type: 'string', enum: ['Car', 'Pin'] },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        price: { type: 'number' },
                        images: { type: 'string' },
                        status: { type: 'string' },
                        approved: { type: 'boolean' },
                        createdDate: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        error: { type: 'string' }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                ForbiddenError: {
                    description: 'Insufficient permissions',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        tags: [
            { name: 'Authentication', description: 'Authentication endpoints' },
            { name: 'Users', description: 'User management endpoints' },
            { name: 'Brands', description: 'Brand management endpoints' },
            { name: 'Cars', description: 'Car management endpoints' },
            { name: 'Pins', description: 'Battery pin management endpoints' },
            { name: 'Listings', description: 'Listing management endpoints' },
            { name: 'Auctions', description: 'Auction system endpoints' },
            { name: 'Orders', description: 'Order management endpoints' },
            { name: 'Payments', description: 'Payment processing endpoints' },
            { name: 'Reviews', description: 'Review and rating endpoints' },
            { name: 'Favorites', description: 'Favorite listings endpoints' },
            { name: 'Notifications', description: 'Notification endpoints' },
            { name: 'Admin', description: 'Admin management endpoints' },
            { name: 'AI', description: 'AI-powered features' }
        ]
    },
    apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'EV Marketplace API Documentation'
    }));

    // Serve swagger spec as JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

module.exports = setupSwagger;
