/**
 * Tool để tạo password hash cho database
 * Sử dụng: node hash-password.js <password>
 */

const bcrypt = require('bcryptjs');

// Lấy password từ command line argument
const password = process.argv[2];

if (!password) {
    console.log('Usage: node hash-password.js <password>');
    console.log('Example: node hash-password.js 123123');
    process.exit(1);
}

// Hash password
const saltRounds = 12;
bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        process.exit(1);
    }
    
    console.log('\n✅ Password hashed successfully!\n');
    console.log('Original password:', password);
    console.log('Password hash:', hash);
    console.log('\nSQL Query to update user:');
    console.log('----------------------------------------');
    console.log(`UPDATE [User]`);
    console.log(`SET PasswordHash = '${hash}',`);
    console.log(`    Status = 'Active'`);
    console.log(`WHERE Email = 'your-email@example.com';`);
    console.log('----------------------------------------\n');
    
    // Test verify
    bcrypt.compare(password, hash, (err, result) => {
        if (result) {
            console.log('✅ Verification test passed!\n');
        } else {
            console.log('❌ Verification test failed!\n');
        }
    });
});

