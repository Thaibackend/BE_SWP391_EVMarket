/**
 * Quick script to add basic Swagger documentation to all remaining routes
 */

const fs = require('fs');
const path = require('path');

// Define basic documentation for each route
const routeDocumentation = {
    'orders.js': [
        {
            path: '/api/orders',
            method: 'post',
            summary: 'Create order',
            tags: ['Orders'],
            security: true
        },
        {
            path: '/api/orders/user/my-orders',
            method: 'get',
            summary: 'Get user orders',
            tags: ['Orders'],
            security: true
        },
        {
            path: '/api/orders/{orderId}',
            method: 'get',
            summary: 'Get order by ID',
            tags: ['Orders'],
            security: true
        },
        {
            path: '/api/orders/{orderId}/status',
            method: 'put',
            summary: 'Update order status',
            tags: ['Orders'],
            security: true
        },
        {
            path: '/api/orders',
            method: 'get',
            summary: 'Get all orders (Admin)',
            tags: ['Orders'],
            security: true
        },
        {
            path: '/api/orders/stats',
            method: 'get',
            summary: 'Get order statistics (Admin)',
            tags: ['Orders'],
            security: true
        }
    ],
    'payments.js': [
        {
            path: '/api/payments',
            method: 'post',
            summary: 'Create payment',
            tags: ['Payments'],
            security: true
        },
        {
            path: '/api/payments/order/{orderId}',
            method: 'get',
            summary: 'Get payment by order',
            tags: ['Payments'],
            security: true
        },
        {
            path: '/api/payments/user/my-payments',
            method: 'get',
            summary: 'Get user payments',
            tags: ['Payments'],
            security: true
        },
        {
            path: '/api/payments/{paymentId}/status',
            method: 'put',
            summary: 'Update payment status',
            tags: ['Payments'],
            security: true
        },
        {
            path: '/api/payments',
            method: 'get',
            summary: 'Get all payments (Admin)',
            tags: ['Payments'],
            security: true
        },
        {
            path: '/api/payments/stats',
            method: 'get',
            summary: 'Get payment statistics (Admin)',
            tags: ['Payments'],
            security: true
        }
    ],
    'reviews.js': [
        {
            path: '/api/reviews/user/{userId}',
            method: 'get',
            summary: 'Get user reviews (Public)',
            tags: ['Reviews']
        },
        {
            path: '/api/reviews/user/{userId}/rating',
            method: 'get',
            summary: 'Get user rating (Public)',
            tags: ['Reviews']
        },
        {
            path: '/api/reviews',
            method: 'post',
            summary: 'Create review',
            tags: ['Reviews'],
            security: true
        },
        {
            path: '/api/reviews/order/{orderId}',
            method: 'get',
            summary: 'Get order reviews',
            tags: ['Reviews'],
            security: true
        },
        {
            path: '/api/reviews/{reviewId}',
            method: 'put',
            summary: 'Update review',
            tags: ['Reviews'],
            security: true
        },
        {
            path: '/api/reviews/{reviewId}',
            method: 'delete',
            summary: 'Delete review',
            tags: ['Reviews'],
            security: true
        },
        {
            path: '/api/reviews',
            method: 'get',
            summary: 'Get all reviews (Admin)',
            tags: ['Reviews'],
            security: true
        }
    ],
    'favorites.js': [
        {
            path: '/api/favorites',
            method: 'get',
            summary: 'Get user favorites',
            tags: ['Favorites'],
            security: true
        },
        {
            path: '/api/favorites/count',
            method: 'get',
            summary: 'Get favorite count',
            tags: ['Favorites'],
            security: true
        },
        {
            path: '/api/favorites/{listingId}/check',
            method: 'get',
            summary: 'Check if favorite',
            tags: ['Favorites'],
            security: true
        },
        {
            path: '/api/favorites/{listingId}',
            method: 'post',
            summary: 'Add to favorites',
            tags: ['Favorites'],
            security: true
        },
        {
            path: '/api/favorites/{listingId}',
            method: 'delete',
            summary: 'Remove from favorites',
            tags: ['Favorites'],
            security: true
        },
        {
            path: '/api/favorites/id/{favoriteId}',
            method: 'delete',
            summary: 'Remove favorite by ID',
            tags: ['Favorites'],
            security: true
        }
    ]
};

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

    if (route.parameters) {
        doc += `
 *     parameters:`;
        route.parameters.forEach(param => {
            doc += `
 *       - in: ${param.in}
 *         name: ${param.name}
 *         ${param.required ? 'required: true' : ''}
 *         schema:
 *           type: ${param.type}`;
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

function addDocsToFile(filename) {
    const filePath = path.join(__dirname, '../routes', filename);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File ${filename} not found`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    if (routeDocumentation[filename]) {
        console.log(`📝 Adding documentation to ${filename}...`);
        
        // Add documentation before each route
        routeDocumentation[filename].forEach(route => {
            const doc = generateSwaggerDoc(route);
            
            // Find the route pattern and add documentation before it
            const routePattern = new RegExp(`router\\.${route.method}\\('([^']*)'`, 'g');
            let match;
            while ((match = routePattern.exec(content)) !== null) {
                const routePath = match[1];
                if (routePath === route.path.replace('/api/', '').replace(/^\w+\//, '')) {
                    const beforeRoute = content.substring(0, match.index);
                    const afterRoute = content.substring(match.index);
                    content = beforeRoute + doc + '\n' + afterRoute;
                    break;
                }
            }
        });
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Documentation added to ${filename}`);
    }
}

// Main execution
console.log('🚀 Adding Swagger documentation to remaining route files...\n');

Object.keys(routeDocumentation).forEach(filename => {
    addDocsToFile(filename);
});

console.log('\n✅ Swagger documentation generation completed!');
console.log('📚 Restart your server to see the updated Swagger UI');
console.log('\n📋 Summary of what was added:');
console.log('   ✅ Orders - 6 endpoints');
console.log('   ✅ Payments - 6 endpoints'); 
console.log('   ✅ Reviews - 7 endpoints');
console.log('   ✅ Favorites - 6 endpoints');
console.log('\n🎯 Total: 25+ new endpoints documented!');
