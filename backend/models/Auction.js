const { sql } = require('../config/database');

class Auction {
    constructor(data) {
        this.auctionId = data.auctionId;
        this.listingId = data.listingId;
        this.userId = data.userId;
        this.bidPrice = data.bidPrice;
        this.bidTime = data.bidTime;
        this.status = data.status;
    }

    static async create(auctionData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('listingId', sql.Int, auctionData.listingId);
        request.input('userId', sql.Int, auctionData.userId);
        request.input('bidPrice', sql.Decimal(18,2), auctionData.bidPrice);
        request.input('status', sql.NVarChar(20), auctionData.status || 'Active');

        const result = await request.query(`
            INSERT INTO Auction (ListingId, UserId, BidPrice, Status)
            OUTPUT INSERTED.AuctionId, INSERTED.ListingId, INSERTED.UserId, 
                   INSERTED.BidPrice, INSERTED.BidTime, INSERTED.Status
            VALUES (@listingId, @userId, @bidPrice, @status)
        `);

        return new Auction(result.recordset[0]);
    }

    static async getByListingId(listingId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('listingId', sql.Int, listingId);

        const result = await request.query(`
            SELECT a.*, u.FullName as BidderName, u.Email as BidderEmail
            FROM Auction a
            LEFT JOIN [User] u ON a.UserId = u.UserId
            WHERE a.ListingId = @listingId AND a.Status = 'Active'
            ORDER BY a.BidPrice DESC, a.BidTime ASC
        `);

        return result.recordset;
    }

    static async getHighestBid(listingId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('listingId', sql.Int, listingId);

        const result = await request.query(`
            SELECT TOP 1 a.*, u.FullName as BidderName, u.Email as BidderEmail
            FROM Auction a
            LEFT JOIN [User] u ON a.UserId = u.UserId
            WHERE a.ListingId = @listingId AND a.Status = 'Active'
            ORDER BY a.BidPrice DESC, a.BidTime ASC
        `);

        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    static async getByUserId(userId, page = 1, limit = 10) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        const offset = (page - 1) * limit;
        request.input('userId', sql.Int, userId);
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        const result = await request.query(`
            SELECT a.*, l.Title as ListingTitle, l.Price as ListingPrice,
                   c.Model as CarModel, c.Year as CarYear,
                   p.Model as PinModel, p.Capacity as PinCapacity,
                   b.BrandName
            FROM Auction a
            LEFT JOIN Listing l ON a.ListingId = l.ListingId
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin p ON l.PinId = p.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR p.BrandId = b.BrandId)
            WHERE a.UserId = @userId
            ORDER BY a.BidTime DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

        return result.recordset;
    }

    static async updateStatus(auctionId, status) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('auctionId', sql.Int, auctionId);
        request.input('status', sql.NVarChar(20), status);

        const result = await request.query(`
            UPDATE Auction 
            SET Status = @status
            WHERE AuctionId = @auctionId
            SELECT * FROM Auction WHERE AuctionId = @auctionId
        `);

        return result.recordset.length > 0 ? new Auction(result.recordset[0]) : null;
    }

    static async getAuctionHistory(listingId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('listingId', sql.Int, listingId);

        const result = await request.query(`
            SELECT a.*, u.FullName as BidderName, u.Email as BidderEmail
            FROM Auction a
            LEFT JOIN [User] u ON a.UserId = u.UserId
            WHERE a.ListingId = @listingId
            ORDER BY a.BidTime DESC
        `);

        return result.recordset;
    }
}

module.exports = Auction;
