const { sql } = require('../config/database');

class FavoriteListing {
    constructor(data) {
        this.favoriteId = data.favoriteId;
        this.userId = data.userId;
        this.listingId = data.listingId;
        this.createdDate = data.createdDate;
    }

    static async create(favoriteData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('userId', sql.Int, favoriteData.userId);
        request.input('listingId', sql.Int, favoriteData.listingId);

        const result = await request.query(`
            INSERT INTO FavoriteListing (UserId, ListingId)
            OUTPUT INSERTED.FavoriteId, INSERTED.UserId, INSERTED.ListingId, INSERTED.CreatedDate
            VALUES (@userId, @listingId)
        `);

        return new FavoriteListing(result.recordset[0]);
    }

    static async getByUserId(userId, page = 1, limit = 10) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        const offset = (page - 1) * limit;
        request.input('userId', sql.Int, userId);
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        const result = await request.query(`
            SELECT f.*, l.Title, l.Description, l.Price, l.Images, l.ListingType, l.Status, l.Approved,
                   l.CreatedDate as ListingCreatedDate,
                   u.FullName as SellerName, u.Email as SellerEmail,
                   c.Model as CarModel, c.Year as CarYear, c.BatteryCapacity, c.Kilometers,
                   p.Model as PinModel, p.Capacity as PinCapacity, p.ManufactureYear,
                   b.BrandName
            FROM FavoriteListing f
            LEFT JOIN Listing l ON f.ListingId = l.ListingId
            LEFT JOIN [User] u ON l.UserId = u.UserId
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin p ON l.PinId = p.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR p.BrandId = b.BrandId)
            WHERE f.UserId = @userId
            ORDER BY f.CreatedDate DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

        return result.recordset;
    }

    static async checkFavorite(userId, listingId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('userId', sql.Int, userId);
        request.input('listingId', sql.Int, listingId);

        const result = await request.query(`
            SELECT FavoriteId FROM FavoriteListing 
            WHERE UserId = @userId AND ListingId = @listingId
        `);

        return result.recordset.length > 0;
    }

    static async remove(userId, listingId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('userId', sql.Int, userId);
        request.input('listingId', sql.Int, listingId);

        const result = await request.query(`
            DELETE FROM FavoriteListing 
            WHERE UserId = @userId AND ListingId = @listingId
        `);

        return result.rowsAffected[0] > 0;
    }

    static async removeById(favoriteId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('favoriteId', sql.Int, favoriteId);

        const result = await request.query(`
            DELETE FROM FavoriteListing WHERE FavoriteId = @favoriteId
        `);

        return result.rowsAffected[0] > 0;
    }

    static async getTotalCount(userId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('userId', sql.Int, userId);

        const result = await request.query(`
            SELECT COUNT(*) as total FROM FavoriteListing WHERE UserId = @userId
        `);

        return result.recordset[0].total;
    }
}

module.exports = FavoriteListing;
