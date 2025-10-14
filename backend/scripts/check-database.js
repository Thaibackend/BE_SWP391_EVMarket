const { getPool } = require('../config/database');
const { sql } = require('../config/database');

async function checkDatabase() {
    try {
        const pool = getPool();
        const request = pool.request();

        console.log('=== CHECKING DATABASE ===');

        // Check all listings
        const allListings = await request.query(`
            SELECT ListingId, UserId, Title, Approved, Status, CreatedDate
            FROM Listing
            ORDER BY CreatedDate DESC
        `);

        console.log('All listings in database:');
        console.log(allListings.recordset);

        // Check pending listings specifically
        const pendingListings = await request.query(`
            SELECT ListingId, UserId, Title, Approved, Status, CreatedDate
            FROM Listing
            WHERE Approved = 0
            ORDER BY CreatedDate DESC
        `);

        console.log('\nPending listings (Approved = 0):');
        console.log(pendingListings.recordset);

        // Check user 1's listings
        const userListings = await request.query(`
            SELECT ListingId, UserId, Title, Approved, Status, CreatedDate
            FROM Listing
            WHERE UserId = 1
            ORDER BY CreatedDate DESC
        `);

        console.log('\nUser 1 listings:');
        console.log(userListings.recordset);

        // Check user 1's pending listings
        const userPendingListings = await request.query(`
            SELECT ListingId, UserId, Title, Approved, Status, CreatedDate
            FROM Listing
            WHERE UserId = 1 AND Approved = 0
            ORDER BY CreatedDate DESC
        `);

        console.log('\nUser 1 pending listings:');
        console.log(userPendingListings.recordset);

    } catch (error) {
        console.error('Database check error:', error);
    }
}

checkDatabase();


