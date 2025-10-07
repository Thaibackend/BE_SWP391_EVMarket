const { sql } = require('../config/database');

class User {
    constructor(data) {
        // SQL Server returns PascalCase, convert to camelCase
        this.userId = data.UserId || data.userId;
        this.email = data.Email || data.email;
        this.phone = data.Phone || data.phone;
        this.passwordHash = data.PasswordHash || data.passwordHash;
        this.fullName = data.FullName || data.fullName;
        this.avatarUrl = data.AvatarUrl || data.avatarUrl;
        this.role = data.Role || data.role;
        this.status = data.Status || data.status;
        this.createdDate = data.CreatedDate || data.createdDate;
    }

    static async create(userData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('email', sql.NVarChar(100), userData.email);
        request.input('phone', sql.NVarChar(20), userData.phone);
        request.input('passwordHash', sql.NVarChar(255), userData.passwordHash);
        request.input('fullName', sql.NVarChar(100), userData.fullName);
        request.input('avatarUrl', sql.NVarChar(255), userData.avatarUrl);
        request.input('role', sql.NVarChar(20), userData.role || 'Member');
        request.input('status', sql.NVarChar(20), userData.status || 'Active');

        const result = await request.query(`
            INSERT INTO [User] (Email, Phone, PasswordHash, FullName, AvatarUrl, Role, Status)
            OUTPUT INSERTED.UserId, INSERTED.Email, INSERTED.Phone, INSERTED.FullName, 
                   INSERTED.AvatarUrl, INSERTED.Role, INSERTED.Status, INSERTED.CreatedDate
            VALUES (@email, @phone, @passwordHash, @fullName, @avatarUrl, @role, @status)
        `);

        return new User(result.recordset[0]);
    }

    static async findByEmail(email) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('email', sql.NVarChar(100), email);

        const result = await request.query(`
            SELECT UserId, Email, Phone, PasswordHash, FullName, AvatarUrl, Role, Status, CreatedDate
            FROM [User] WHERE Email = @email
        `);

        return result.recordset.length > 0 ? new User(result.recordset[0]) : null;
    }

    static async findById(userId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('userId', sql.Int, userId);

        const result = await request.query(`
            SELECT UserId, Email, Phone, PasswordHash, FullName, AvatarUrl, Role, Status, CreatedDate
            FROM [User] WHERE UserId = @userId
        `);

        return result.recordset.length > 0 ? new User(result.recordset[0]) : null;
    }

    static async update(userId, updateData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('userId', sql.Int, userId);
        
        const updateFields = [];
        const allowedFields = ['phone', 'fullName', 'avatarUrl', 'status'];
        
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                request.input(field, sql.NVarChar, updateData[field]);
                updateFields.push(`${field} = @${field}`);
            }
        });

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        const result = await request.query(`
            UPDATE [User] 
            SET ${updateFields.join(', ')}
            WHERE UserId = @userId
            SELECT UserId, Email, Phone, FullName, AvatarUrl, Role, Status, CreatedDate
            FROM [User] WHERE UserId = @userId
        `);

        return new User(result.recordset[0]);
    }

    static async getAll(page = 1, limit = 10, role = null) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        const offset = (page - 1) * limit;
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);
        
        let whereClause = '';
        if (role) {
            request.input('role', sql.NVarChar(20), role);
            whereClause = 'WHERE Role = @role';
        }

        const result = await request.query(`
            SELECT UserId, Email, Phone, FullName, AvatarUrl, Role, Status, CreatedDate
            FROM [User] ${whereClause}
            ORDER BY CreatedDate DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

        return result.recordset.map(user => new User(user));
    }

    static async getTotalCount(role = null) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        let whereClause = '';
        if (role) {
            request.input('role', sql.NVarChar(20), role);
            whereClause = 'WHERE Role = @role';
        }

        const result = await request.query(`
            SELECT COUNT(*) as total FROM [User] ${whereClause}
        `);

        return result.recordset[0].total;
    }

    toJSON() {
        const { passwordHash, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

module.exports = User;
