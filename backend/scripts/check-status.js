const { getPool } = require('../config/database');
const { sql } = require('../config/database');

async function checkStatus() {
    try {
        const pool = getPool();
        const request = pool.request();

        console.log('=== CHECKING LISTING STATUS VALUES ===');

        // Check all unique status values
        const statusValues = await request.query(`
            SELECT DISTINCT Status, COUNT(*) as Count
            FROM Listing
            GROUP BY Status
            ORDER BY Status
        `);

        console.log('All Status values in database:');
        console.log(statusValues.recordset);

        // Check all unique approved values
        const approvedValues = await request.query(`
            SELECT DISTINCT Approved, COUNT(*) as Count
            FROM Listing
            GROUP BY Approved
            ORDER BY Approved
        `);

        console.log('\nAll Approved values in database:');
        console.log(approvedValues.recordset);

        // Check table structure
        const tableStructure = await request.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Listing'
            AND COLUMN_NAME IN ('Status', 'Approved')
            ORDER BY ORDINAL_POSITION
        `);

        console.log('\nTable structure for Status and Approved columns:');
        console.log(tableStructure.recordset);

        // Check all listings with details
        const allListings = await request.query(`
            SELECT ListingId, UserId, Title, Status, Approved, CreatedDate
            FROM Listing
            ORDER BY CreatedDate DESC
        `);

        console.log('\nAll listings with Status and Approved:');
        console.log(allListings.recordset);

    } catch (error) {
        console.error('Status check error:', error);
    }
}

checkStatus();


