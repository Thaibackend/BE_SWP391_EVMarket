/**
 * Script to add Swagger documentation to all route files
 */

const fs = require('fs');
const path = require('path');

// Define documentation for each route file
const routeDocs = {
    'auctions.js': {
        routes: [
            {
                path: '/api/auctions/{listingId}/history',
                method: 'get',
                summary: 'Get auction history (Public)',
                tags: ['Auctions'],
                parameters: [
                    { name: 'listingId', in: 'path', required: true, type: 'integer' }
                ]
            },
            {
                path: '/api/auctions/{listingId}/highest-bid',
                method: 'get',
                summary: 'Get highest bid (Public)',
                tags: ['Auctions'],
                parameters: [
                    { name: 'listingId', in: 'path', required: true, type: 'integer' }
                ]
            },
            {
                path: '/api/auctions/{listingId}/bid',
                method: 'post',
                summary: 'Place a bid',
                tags: ['Auctions'],
                security: true,
                parameters: [
                    { name: 'listingId', in: 'path', required: true, type: 'integer' }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['bidPrice'],
                                properties: {
                                    bidPrice: { type: 'number', minimum: 0 }
                                }
                            }
                        }
                    }
                }
            },
            {
                path: '/api/auctions/user/my-bids',
                method: 'get',
                summary: 'Get current user\'s bids',
                tags: ['Auctions'],
                security: true,
                parameters: [
                    { name: 'page', in: 'query', type: 'integer', default: 1 },
                    { name: 'limit', in: 'query', type: 'integer', default: 10 }
                ]
            },
            {
                path: '/api/auctions/{listingId}/bids',
                method: 'get',
                summary: 'Get all bids for listing (Seller only)',
                tags: ['Auctions'],
                security: true,
                parameters: [
                    { name: 'listingId', in: 'path', required: true, type: 'integer' }
                ]
            },
            {
                path: '/api/auctions/{listingId}/end',
                method: 'post',
                summary: 'End auction (Seller only)',
                tags: ['Auctions'],
                security: true,
                parameters: [
                    { name: 'listingId', in: 'path', required: true, type: 'integer' }
                ]
            }
        ]
    },
    'brands.js': {
        routes: [
            {
                path: '/api/brands',
                method: 'get',
                summary: 'Get all brands (Public)',
                tags: ['Brands']
            },
            {
                path: '/api/brands',
                method: 'post',
                summary: 'Create new brand (Admin only)',
                tags: ['Brands'],
                security: true,
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'type'],
                                properties: {
                                    name: { type: 'string' },
                                    type: { type: 'string', enum: ['Car', 'Pin'] },
                                    logoUrl: { type: 'string' },
                                    description: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            },
            {
                path: '/api/brands/{brandId}',
                method: 'get',
                summary: 'Get brand by ID (Public)',
                tags: ['Brands'],
                parameters: [
                    { name: 'brandId', in: 'path', required: true, type: 'integer' }
                ]
            },
            {
                path: '/api/brands/{brandId}',
                method: 'put',
                summary: 'Update brand (Admin only)',
                tags: ['Brands'],
                security: true,
                parameters: [
                    { name: 'brandId', in: 'path', required: true, type: 'integer' }
                ]
            },
            {
                path: '/api/brands/{brandId}',
                method: 'delete',
                summary: 'Delete brand (Admin only)',
                tags: ['Brands'],
                security: true,
                parameters: [
                    { name: 'brandId', in: 'path', required: true, type: 'integer' }
                ]
            }
        ]
    },
    'cars.js': {
        routes: [
            {
                path: '/api/cars',
                method: 'get',
                summary: 'Get all cars (Public)',
                tags: ['Cars']
            },
            {
                path: '/api/cars',
                method: 'post',
                summary: 'Create new car (Admin only)',
                tags: ['Cars'],
                security: true
            },
            {
                path: '/api/cars/search',
                method: 'get',
                summary: 'Search cars (Public)',
                tags: ['Cars']
            },
            {
                path: '/api/cars/{carId}',
                method: 'get',
                summary: 'Get car by ID (Public)',
                tags: ['Cars'],
                parameters: [
                    { name: 'carId', in: 'path', required: true, type: 'integer' }
                ]
            },
            {
                path: '/api/cars/{carId}',
                method: 'put',
                summary: 'Update car (Admin only)',
                tags: ['Cars'],
                security: true,
                parameters: [
                    { name: 'carId', in: 'path', required: true, type: 'integer' }
                ]
            },
            {
                path: '/api/cars/{carId}',
                method: 'delete',
                summary: 'Delete car (Admin only)',
                tags: ['Cars'],
                security: true,
                parameters: [
                    { name: 'carId', in: 'path', required: true, type: 'integer' }
                ]
            }
        ]
    },
    'pins.js': {
        routes: [
            {
                path: '/api/pins',
                method: 'get',
                summary: 'Get all pins (Public)',
                tags: ['Pins']
            },
            {
                path: '/api/pins',
                method: 'post',
                summary: 'Create new pin (Admin only)',
                tags: ['Pins'],
                security: true
            },
            {
                path: '/api/pins/search',
                method: 'get',
                summary: 'Search pins (Public)',
                tags: ['Pins']
            },
            {
                path: '/api/pins/{pinId}',
                method: 'get',
                summary: 'Get pin by ID (Public)',
                tags: ['Pins'],
                parameters: [
                    { name: 'pinId', in: 'path', required: true, type: 'integer' }
                ]
            },
            {
                path: '/api/pins/{pinId}',
                method: 'put',
                summary: 'Update pin (Admin only)',
                tags: ['Pins'],
                security: true,
                parameters: [
                    { name: 'pinId', in: 'path', required: true, type: 'integer' }
                ]
            },
            {
                path: '/api/pins/{pinId}',
                method: 'delete',
                summary: 'Delete pin (Admin only)',
                tags: ['Pins'],
                security: true,
                parameters: [
                    { name: 'pinId', in: 'path', required: true, type: 'integer' }
                ]
            }
        ]
    }
};

// Function to generate Swagger JSDoc comment
function generateSwaggerDoc(route) {
    let doc = `/**
 * @swagger
 * ${route.path}:
 *   ${route.method}:
 *     tags: [${route.tags.join(', ')}]
 *     summary: ${route.summary}`;

    if (route.security) {
        doc += `
 *     security:
 *       - bearerAuth: []`;
    }

    if (route.parameters && route.parameters.length > 0) {
        doc += `
 *     parameters:`;
        route.parameters.forEach(param => {
            doc += `
 *       - in: ${param.in}
 *         name: ${param.name}
 *         ${param.required ? 'required: true' : ''}
 *         schema:
 *           type: ${param.type}
 *         ${param.default ? `default: ${param.default}` : ''}`;
        });
    }

    if (route.requestBody) {
        doc += `
 *     requestBody:
 *       required: ${route.requestBody.required}
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [${route.requestBody.content['application/json'].schema.required.join(', ')}]
 *             properties:`;
        Object.entries(route.requestBody.content['application/json'].schema.properties).forEach(([key, value]) => {
            doc += `
 *               ${key}:
 *                 type: ${value.type}`;
            if (value.enum) {
                doc += `
 *                 enum: [${value.enum.join(', ')}]`;
            }
            if (value.minimum !== undefined) {
                doc += `
 *                 minimum: ${value.minimum}`;
            }
        });
    }

    doc += `
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found`;

    return doc + `
 */`;
}

// Function to add documentation to a route file
function addDocsToFile(filename) {
    const filePath = path.join(__dirname, '../routes', filename);
    
    if (!fs.existsSync(filePath)) {
        console.log(`File ${filename} not found, skipping...`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    if (routeDocs[filename]) {
        console.log(`Adding documentation to ${filename}...`);
        
        // Add documentation before each route
        routeDocs[filename].routes.forEach(route => {
            const doc = generateSwaggerDoc(route);
            const routePattern = new RegExp(`router\\.${route.method}\\('${route.path.replace(/\{.*?\}/g, '[^']*')}'.*?\\n`, 'g');
            
            if (routePattern.test(content)) {
                content = content.replace(routePattern, (match) => {
                    return doc + '\n' + match;
                });
            }
        });
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Documentation added to ${filename}`);
    }
}

// Main execution
console.log('🚀 Adding Swagger documentation to route files...\n');

Object.keys(routeDocs).forEach(filename => {
    addDocsToFile(filename);
});

console.log('\n✅ Swagger documentation generation completed!');
console.log('📚 Restart your server to see the updated Swagger UI');
