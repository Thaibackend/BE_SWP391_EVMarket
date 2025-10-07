/**
 * Script để test kết nối SQL Server
 * Chạy: node test-connection.js
 */

require('dotenv').config();
const sql = require('mssql');

// Hiển thị thông tin kết nối
console.log('='.repeat(60));
console.log('TESTING SQL SERVER CONNECTION');
console.log('='.repeat(60));
console.log('\nConfiguration:');
console.log('  Server:', process.env.DB_SERVER || 'localhost');
console.log('  Database:', process.env.DB_NAME || 'MarketplaceDB');
console.log('  Port:', process.env.DB_PORT || 1433);
console.log('  User:', process.env.DB_USER || '(Windows Authentication)');
console.log('');

const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'MarketplaceDB',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

// Chọn authentication method
if (process.env.DB_USER && process.env.DB_PASSWORD) {
    console.log('Using: SQL Server Authentication');
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
    config.authentication = {
        type: 'default'
    };
} else {
    console.log('Using: Windows Authentication');
    config.options.trustedConnection = true;
    config.authentication = {
        type: 'ntlm',
        options: {
            domain: '',
            userName: '',
            password: ''
        }
    };
}

console.log('\nAttempting to connect...\n');

async function testConnection() {
    try {
        // Test connection
        const pool = await sql.connect(config);
        console.log('✅ CONNECTION SUCCESSFUL!');
        console.log('');
        
        // Test query
        console.log('Testing query...');
        const result = await pool.request().query('SELECT @@VERSION as Version, DB_NAME() as CurrentDB');
        console.log('✅ QUERY SUCCESSFUL!');
        console.log('');
        console.log('Database Info:');
        console.log('  Current Database:', result.recordset[0].CurrentDB);
        console.log('  SQL Server Version:', result.recordset[0].Version.substring(0, 100) + '...');
        console.log('');
        
        // Check if tables exist
        console.log('Checking tables...');
        const tables = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);
        
        if (tables.recordset.length > 0) {
            console.log('✅ Tables found:', tables.recordset.length);
            console.log('');
            console.log('Tables list:');
            tables.recordset.forEach((table, index) => {
                console.log(`  ${index + 1}. ${table.TABLE_NAME}`);
            });
        } else {
            console.log('⚠️  No tables found! Please run database_script.sql first.');
        }
        
        console.log('');
        console.log('='.repeat(60));
        console.log('✅ ALL TESTS PASSED!');
        console.log('='.repeat(60));
        console.log('');
        console.log('Your database is ready. You can now start the server:');
        console.log('  npm run dev');
        console.log('');
        
        await pool.close();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ CONNECTION FAILED!');
        console.error('');
        console.error('Error Details:');
        console.error('  Code:', error.code);
        console.error('  Message:', error.message);
        console.error('');
        console.error('='.repeat(60));
        console.error('TROUBLESHOOTING STEPS:');
        console.error('='.repeat(60));
        
        if (error.code === 'ELOGIN') {
            console.error('\n❌ Login Failed:');
            console.error('  1. Check your username and password in .env');
            console.error('  2. Make sure SQL Server Authentication is enabled');
            console.error('  3. Or try using Windows Authentication (remove DB_USER and DB_PASSWORD from .env)');
        } else if (error.code === 'ETIMEOUT' || error.code === 'ESOCKET') {
            console.error('\n❌ Cannot Connect to Server:');
            console.error('  1. Check if SQL Server is running:');
            console.error('     - Open Services (services.msc)');
            console.error('     - Look for "SQL Server (SQLEXPRESS)"');
            console.error('     - Make sure it is Started');
            console.error('  2. Check server name in .env:');
            console.error('     - Try: localhost\\\\SQLEXPRESS');
            console.error('     - Or: (localdb)\\\\MSSQLLocalDB');
            console.error('     - Or just: localhost');
            console.error('  3. Enable TCP/IP:');
            console.error('     - Open SQL Server Configuration Manager');
            console.error('     - SQL Server Network Configuration > Protocols');
            console.error('     - Enable TCP/IP');
            console.error('     - Restart SQL Server');
        } else if (error.code === 'ENOTFOUND') {
            console.error('\n❌ Server Not Found:');
            console.error('  1. Check DB_SERVER in .env file');
            console.error('  2. Common values:');
            console.error('     - localhost\\\\SQLEXPRESS');
            console.error('     - (localdb)\\\\MSSQLLocalDB');
            console.error('     - .\\\\SQLEXPRESS');
            console.error('  3. Find your server name:');
            console.error('     - Open SQL Server Management Studio');
            console.error('     - Check the server name when connecting');
        } else if (error.originalError && error.originalError.message.includes('database')) {
            console.error('\n❌ Database Not Found:');
            console.error('  1. Make sure you created the database');
            console.error('  2. Run database_script.sql in SSMS');
            console.error('  3. Or create database manually:');
            console.error('     CREATE DATABASE MarketplaceDB;');
        }
        
        console.error('\n📝 Current Configuration:');
        console.error('  DB_SERVER=' + (process.env.DB_SERVER || 'localhost'));
        console.error('  DB_NAME=' + (process.env.DB_NAME || 'MarketplaceDB'));
        console.error('  DB_PORT=' + (process.env.DB_PORT || 1433));
        console.error('  DB_USER=' + (process.env.DB_USER || '(not set - using Windows Auth)'));
        
        console.error('\n💡 Quick Fix:');
        console.error('  1. Make sure .env file exists in backend/ folder');
        console.error('  2. For Windows Authentication, .env should have:');
        console.error('     DB_SERVER=localhost\\\\SQLEXPRESS');
        console.error('     DB_NAME=MarketplaceDB');
        console.error('     (do NOT set DB_USER and DB_PASSWORD)');
        console.error('');
        
        process.exit(1);
    }
}

// Run test
testConnection();
