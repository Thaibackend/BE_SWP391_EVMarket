-- Update user để fix lỗi 401
USE MarketplaceDB;
GO

-- Option 1: Update Status thành Active
UPDATE [User] 
SET Status = 'Active'
WHERE Email = 'thai@gmail.com';

-- Option 2: Update password hash (password: 123123)
UPDATE [User]
SET PasswordHash = '$2a$12$rg3LhN3YhZKEMRLqN6rJyeWF.YWJ3qXE3Zr3YXGqXxV0gKmL.8CmC',
    Status = 'Active'
WHERE Email = 'thai@gmail.com';

-- Kiểm tra kết quả
SELECT UserId, Email, FullName, Role, Status 
FROM [User] 
WHERE Email = 'thai@gmail.com';

PRINT 'User updated successfully!';
GO
