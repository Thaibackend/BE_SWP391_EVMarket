const { connectDB } = require('../config/database');
const { sql } = require('../config/database');

async function quickSeed() {
    try {
        await connectDB();
        const pool = require('../config/database').getPool();
        const request = pool.request();

        // Create Tesla brand
        const brandResult = await request.query(`
            IF NOT EXISTS (SELECT 1 FROM Brand WHERE BrandName = 'Tesla')
            BEGIN
                INSERT INTO Brand (BrandName) VALUES ('Tesla')
            END
            SELECT BrandId FROM Brand WHERE BrandName = 'Tesla'
        `);
        
        const brandId = brandResult.recordset[0].BrandId;
        console.log('✅ Tesla brand created/found with ID:', brandId);

        // Create Tesla Model 3 car
        const carResult = await request.query(`
            IF NOT EXISTS (SELECT 1 FROM Car WHERE Model = 'Model 3' AND BrandId = ${brandId})
            BEGIN
                INSERT INTO Car (BrandId, Model, Year, BatteryCapacity, Kilometers, Description, Status)
                VALUES (${brandId}, 'Model 3', 2020, 75.0, 15000, 'Tesla Model 3 Standard Range Plus', 'Active')
            END
            SELECT CarId FROM Car WHERE Model = 'Model 3' AND BrandId = ${brandId}
        `);
        
        const carId = carResult.recordset[0].CarId;
        console.log('✅ Tesla Model 3 car created/found with ID:', carId);

        // Create test user
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const userResult = await request.query(`
            IF NOT EXISTS (SELECT 1 FROM [User] WHERE Email = 'thai@gmail.com')
            BEGIN
                INSERT INTO [User] (Email, PasswordHash, FullName, Phone, Role, Status)
                VALUES ('thai@gmail.com', '${hashedPassword}', 'Thai User', '0123456789', 'Member', 'Active')
            END
            SELECT UserId FROM [User] WHERE Email = 'thai@gmail.com'
        `);
        
        const userId = userResult.recordset[0].UserId;
        console.log('✅ Test user created/found with ID:', userId);

        console.log('\n🎉 Quick seed completed!');
        console.log('📋 You can now use:');
        console.log(`   🚗 Car ID: ${carId} (Tesla Model 3)`);
        console.log(`   👤 User: thai@gmail.com / password123`);
        console.log(`   🔑 User ID: ${userId}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

quickSeed();
