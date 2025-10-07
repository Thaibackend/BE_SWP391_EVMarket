const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'MarketplaceDB',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Nếu có DB_USER và DB_PASSWORD thì dùng SQL Authentication
// Nếu không thì dùng Windows Authentication
if (process.env.DB_USER && process.env.DB_PASSWORD) {
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
    config.authentication = {
        type: 'default'
    };
} else {
    // Windows Authentication
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

console.log('Database Configuration:', {
    server: config.server,
    database: config.database,
    port: config.port,
    authType: config.user ? 'SQL Authentication' : 'Windows Authentication'
});

let pool;

const connectDB = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log('Connected to SQL Server database');
        }
        return pool;
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error('Database not connected. Call connectDB() first.');
    }
    return pool;
};

const closeDB = async () => {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('Database connection closed');
        }
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
};

module.exports = {
    connectDB,
    getPool,
    closeDB,
    sql
};
