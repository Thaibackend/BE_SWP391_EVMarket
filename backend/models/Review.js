const { sql } = require('../config/database');

class Review {
    constructor(data) {
        this.reviewId = data.reviewId;
        this.orderId = data.orderId;
        this.reviewerId = data.reviewerId;
        this.revieweeId = data.revieweeId;
        this.rating = data.rating;
        this.comment = data.comment;
        this.createdDate = data.createdDate;
    }

    static async create(reviewData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('orderId', sql.Int, reviewData.orderId);
        request.input('reviewerId', sql.Int, reviewData.reviewerId);
        request.input('revieweeId', sql.Int, reviewData.revieweeId);
        request.input('rating', sql.Int, reviewData.rating);
        request.input('comment', sql.NVarChar(1000), reviewData.comment);

        const result = await request.query(`
            INSERT INTO Review (OrderId, ReviewerId, RevieweeId, Rating, Comment)
            OUTPUT INSERTED.ReviewId, INSERTED.OrderId, INSERTED.ReviewerId, 
                   INSERTED.RevieweeId, INSERTED.Rating, INSERTED.Comment, INSERTED.CreatedDate
            VALUES (@orderId, @reviewerId, @revieweeId, @rating, @comment)
        `);

        return new Review(result.recordset[0]);
    }

    static async getByUserId(userId, userType = 'reviewee', page = 1, limit = 10) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        const offset = (page - 1) * limit;
        request.input('userId', sql.Int, userId);
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        const whereClause = userType === 'reviewee' ? 'WHERE r.RevieweeId = @userId' : 'WHERE r.ReviewerId = @userId';

        const result = await request.query(`
            SELECT r.*, reviewer.FullName as ReviewerName, reviewer.Email as ReviewerEmail,
                   reviewee.FullName as RevieweeName, reviewee.Email as RevieweeEmail,
                   o.OrderStatus, l.Title as ListingTitle, l.ListingType,
                   c.Model as CarModel, c.Year as CarYear,
                   pin.Model as PinModel, pin.Capacity as PinCapacity,
                   b.BrandName
            FROM Review r
            LEFT JOIN [User] reviewer ON r.ReviewerId = reviewer.UserId
            LEFT JOIN [User] reviewee ON r.RevieweeId = reviewee.UserId
            LEFT JOIN [Order] o ON r.OrderId = o.OrderId
            LEFT JOIN Listing l ON o.ListingId = l.ListingId
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin pin ON l.PinId = pin.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR pin.BrandId = b.BrandId)
            ${whereClause}
            ORDER BY r.CreatedDate DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

        return result.recordset;
    }

    static async getByOrderId(orderId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('orderId', sql.Int, orderId);

        const result = await request.query(`
            SELECT r.*, reviewer.FullName as ReviewerName, reviewer.Email as ReviewerEmail,
                   reviewee.FullName as RevieweeName, reviewee.Email as RevieweeEmail
            FROM Review r
            LEFT JOIN [User] reviewer ON r.ReviewerId = reviewer.UserId
            LEFT JOIN [User] reviewee ON r.RevieweeId = reviewee.UserId
            WHERE r.OrderId = @orderId
            ORDER BY r.CreatedDate DESC
        `);

        return result.recordset;
    }

    static async getAverageRating(userId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('userId', sql.Int, userId);

        const result = await request.query(`
            SELECT AVG(CAST(Rating as FLOAT)) as averageRating, COUNT(*) as totalReviews
            FROM Review WHERE RevieweeId = @userId
        `);

        return result.recordset[0];
    }

    static async update(reviewId, updateData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('reviewId', sql.Int, reviewId);
        
        const updateFields = [];
        const allowedFields = ['rating', 'comment'];
        
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
            UPDATE Review 
            SET ${updateFields.join(', ')}
            WHERE ReviewId = @reviewId
            SELECT * FROM Review WHERE ReviewId = @reviewId
        `);

        return result.recordset.length > 0 ? new Review(result.recordset[0]) : null;
    }

    static async delete(reviewId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('reviewId', sql.Int, reviewId);

        const result = await request.query(`
            DELETE FROM Review WHERE ReviewId = @reviewId
        `);

        return result.rowsAffected[0] > 0;
    }

    static async getAll(page = 1, limit = 10) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        const offset = (page - 1) * limit;
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        const result = await request.query(`
            SELECT r.*, reviewer.FullName as ReviewerName, reviewer.Email as ReviewerEmail,
                   reviewee.FullName as RevieweeName, reviewee.Email as RevieweeEmail,
                   o.OrderStatus, l.Title as ListingTitle, l.ListingType,
                   c.Model as CarModel, c.Year as CarYear,
                   pin.Model as PinModel, pin.Capacity as PinCapacity,
                   b.BrandName
            FROM Review r
            LEFT JOIN [User] reviewer ON r.ReviewerId = reviewer.UserId
            LEFT JOIN [User] reviewee ON r.RevieweeId = reviewee.UserId
            LEFT JOIN [Order] o ON r.OrderId = o.OrderId
            LEFT JOIN Listing l ON o.ListingId = l.ListingId
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin pin ON l.PinId = pin.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR pin.BrandId = b.BrandId)
            ORDER BY r.CreatedDate DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

        return result.recordset;
    }
}

module.exports = Review;
