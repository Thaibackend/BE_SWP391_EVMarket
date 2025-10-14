const { connectDB } = require('../config/database');
const Brand = require('../models/Brand');
const Car = require('../models/Car');
const Pin = require('../models/Pin');
const User = require('../models/User');
const bcrypt = require('bcrypt');

async function seedData() {
    try {
        console.log('🌱 Starting data seeding...');
        
        // Connect to database
        await connectDB();
        console.log('✅ Database connected');

        // Create brands
        console.log('📦 Creating brands...');
        const teslaBrand = await Brand.create({ brandName: 'Tesla' });
        const toyotaBrand = await Brand.create({ brandName: 'Toyota' });
        const bmwBrand = await Brand.create({ brandName: 'BMW' });
        console.log('✅ Brands created');

        // Create cars
        console.log('🚗 Creating cars...');
        const teslaModel3 = await Car.create({
            brandId: teslaBrand.brandId,
            model: 'Model 3',
            year: 2020,
            batteryCapacity: 75,
            kilometers: 15000,
            description: 'Tesla Model 3 Standard Range Plus',
            status: 'Active'
        });

        const teslaModelS = await Car.create({
            brandId: teslaBrand.brandId,
            model: 'Model S',
            year: 2021,
            batteryCapacity: 100,
            kilometers: 5000,
            description: 'Tesla Model S Long Range',
            status: 'Active'
        });

        const toyotaPrius = await Car.create({
            brandId: toyotaBrand.brandId,
            model: 'Prius',
            year: 2019,
            batteryCapacity: 8.8,
            kilometers: 25000,
            description: 'Toyota Prius Hybrid',
            status: 'Active'
        });
        console.log('✅ Cars created');

        // Create pins
        console.log('🔋 Creating pins...');
        const teslaPin = await Pin.create({
            brandId: teslaBrand.brandId,
            capacity: 100,
            model: 'Tesla Powerwall',
            status: 'Active',
            manufactureYear: 2022,
            description: 'Tesla Powerwall 2 - 13.5kWh'
        });

        const genericPin = await Pin.create({
            brandId: toyotaBrand.brandId,
            capacity: 50,
            model: 'Generic Home Battery',
            status: 'Active',
            manufactureYear: 2021,
            description: 'Generic home energy storage system'
        });
        console.log('✅ Pins created');

        // Create test users
        console.log('👤 Creating test users...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const memberUser = await User.create({
            email: 'member@test.com',
            password: hashedPassword,
            fullName: 'Test Member',
            phone: '0123456789',
            role: 'Member',
            status: 'Active'
        });

        const adminUser = await User.create({
            email: 'admin@test.com',
            password: hashedPassword,
            fullName: 'Test Admin',
            phone: '0987654321',
            role: 'Admin',
            status: 'Active'
        });
        console.log('✅ Users created');

        console.log('\n🎉 Data seeding completed successfully!');
        console.log('\n📋 Created data:');
        console.log(`   🏷️  Brands: Tesla, Toyota, BMW`);
        console.log(`   🚗 Cars: Tesla Model 3 (ID: ${teslaModel3.carId}), Tesla Model S (ID: ${teslaModelS.carId}), Toyota Prius (ID: ${toyotaPrius.carId})`);
        console.log(`   🔋 Pins: Tesla Powerwall (ID: ${teslaPin.pinId}), Generic Battery (ID: ${genericPin.pinId})`);
        console.log(`   👤 Users: member@test.com, admin@test.com (password: password123)`);
        console.log('\n💡 You can now test the API with these IDs!');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        process.exit(0);
    }
}

seedData();
