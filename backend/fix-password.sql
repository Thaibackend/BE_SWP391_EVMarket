-- Fix password cho user thai@gmail.com
USE MarketplaceDB;
GO

-- Update với password hash mới (password: 123123)
UPDATE [User]
SET PasswordHash = '$2a$12$5pZlGNGYBDPfEHdqYktw6.ePYjBGBTTccqm9srNlKFCpS5ciSRue2',
    Status = 'Active'
WHERE Email = 'thai@gmail.com';

-- Kiểm tra kết quả
SELECT 
    UserId, 
    Email, 
    FullName, 
    Role, 
    Status,
    LEFT(PasswordHash, 30) + '...' as PasswordHash
FROM [User] 
WHERE Email = 'thai@gmail.com';

PRINT '✅ Password updated successfully!';
PRINT 'Email: thai@gmail.com';
PRINT 'Password: 123123';
GO
