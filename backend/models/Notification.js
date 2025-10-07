const { sql } = require('../config/database');

class Notification {
    constructor(data) {
        this.notificationId = data.notificationId;
        this.userId = data.userId;
        this.content = data.content;
        this.isRead = data.isRead;
        this.createdDate = data.createdDate;
    }

    static async create(notificationData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('userId', sql.Int, notificationData.userId);
        request.input('content', sql.NVarChar(1000), notificationData.content);
        request.input('isRead', sql.Bit, notificationData.isRead || 0);

        const result = await request.query(`
            INSERT INTO Notification (UserId, Content, IsRead)
            OUTPUT INSERTED.NotificationId, INSERTED.UserId, INSERTED.Content, 
                   INSERTED.IsRead, INSERTED.CreatedDate
            VALUES (@userId, @content, @isRead)
        `);

        return new Notification(result.recordset[0]);
    }

    static async getByUserId(userId, page = 1, limit = 10, unreadOnly = false) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        const offset = (page - 1) * limit;
        request.input('userId', sql.Int, userId);
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        let whereClause = 'WHERE n.UserId = @userId';
        if (unreadOnly) {
            whereClause += ' AND n.IsRead = 0';
        }

        const result = await request.query(`
            SELECT n.*, u.FullName as UserName
            FROM Notification n
            LEFT JOIN [User] u ON n.UserId = u.UserId
            ${whereClause}
            ORDER BY n.CreatedDate DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

        return result.recordset;
    }

    static async markAsRead(notificationId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('notificationId', sql.Int, notificationId);

        const result = await request.query(`
            UPDATE Notification 
            SET IsRead = 1
            WHERE NotificationId = @notificationId
            SELECT * FROM Notification WHERE NotificationId = @notificationId
        `);

        return result.recordset.length > 0 ? new Notification(result.recordset[0]) : null;
    }

    static async markAllAsRead(userId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('userId', sql.Int, userId);

        const result = await request.query(`
            UPDATE Notification 
            SET IsRead = 1
            WHERE UserId = @userId AND IsRead = 0
        `);

        return result.rowsAffected[0];
    }

    static async getUnreadCount(userId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('userId', sql.Int, userId);

        const result = await request.query(`
            SELECT COUNT(*) as unreadCount
            FROM Notification WHERE UserId = @userId AND IsRead = 0
        `);

        return result.recordset[0].unreadCount;
    }

    static async delete(notificationId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('notificationId', sql.Int, notificationId);

        const result = await request.query(`
            DELETE FROM Notification WHERE NotificationId = @notificationId
        `);

        return result.rowsAffected[0] > 0;
    }

    static async deleteAll(userId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('userId', sql.Int, userId);

        const result = await request.query(`
            DELETE FROM Notification WHERE UserId = @userId
        `);

        return result.rowsAffected[0];
    }

    static async createBulk(notifications) {
        const pool = require('../config/database').getPool();
        const request = pool.request();

        // Create a temporary table for bulk insert
        await request.query(`
            CREATE TABLE #TempNotifications (
                UserId INT,
                Content NVARCHAR(1000),
                IsRead BIT
            )
        `);

        // Insert data into temp table
        for (const notification of notifications) {
            const tempRequest = pool.request();
            tempRequest.input('userId', sql.Int, notification.userId);
            tempRequest.input('content', sql.NVarChar(1000), notification.content);
            tempRequest.input('isRead', sql.Bit, notification.isRead || 0);
            
            await tempRequest.query(`
                INSERT INTO #TempNotifications (UserId, Content, IsRead)
                VALUES (@userId, @content, @isRead)
            `);
        }

        // Insert from temp table to main table
        const result = await request.query(`
            INSERT INTO Notification (UserId, Content, IsRead)
            SELECT UserId, Content, IsRead FROM #TempNotifications
        `);

        // Clean up temp table
        await request.query(`DROP TABLE #TempNotifications`);

        return result.rowsAffected[0];
    }
}

module.exports = Notification;
