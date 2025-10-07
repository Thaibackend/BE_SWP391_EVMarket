const { sql } = require('../config/database');

class Order {
    constructor(data) {
        this.orderId = data.orderId;
        this.listingId = data.listingId;
        this.buyerId = data.buyerId;
        this.sellerId = data.sellerId;
        this.orderType = data.orderType;
        this.orderStatus = data.orderStatus;
        this.createdDate = data.createdDate;
    }

    static async create(orderData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('listingId', sql.Int, orderData.listingId);
        request.input('buyerId', sql.Int, orderData.buyerId);
        request.input('sellerId', sql.Int, orderData.sellerId);
        request.input('orderType', sql.NVarChar(10), orderData.orderType);
        request.input('orderStatus', sql.NVarChar(20), orderData.orderStatus || 'Pending');

        const result = await request.query(`
            INSERT INTO [Order] (ListingId, BuyerId, SellerId, OrderType, OrderStatus)
            OUTPUT INSERTED.OrderId, INSERTED.ListingId, INSERTED.BuyerId, 
                   INSERTED.SellerId, INSERTED.OrderType, INSERTED.OrderStatus, INSERTED.CreatedDate
            VALUES (@listingId, @buyerId, @sellerId, @orderType, @orderStatus)
        `);

        return new Order(result.recordset[0]);
    }

    static async findById(orderId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('orderId', sql.Int, orderId);

        const result = await request.query(`
            SELECT o.*, l.Title as ListingTitle, l.Price as ListingPrice,
                   l.ListingType, l.Images,
                   buyer.FullName as BuyerName, buyer.Email as BuyerEmail,
                   seller.FullName as SellerName, seller.Email as SellerEmail,
                   c.Model as CarModel, c.Year as CarYear, c.BatteryCapacity, c.Kilometers,
                   p.Model as PinModel, p.Capacity as PinCapacity, p.ManufactureYear,
                   b.BrandName
            FROM [Order] o
            LEFT JOIN Listing l ON o.ListingId = l.ListingId
            LEFT JOIN [User] buyer ON o.BuyerId = buyer.UserId
            LEFT JOIN [User] seller ON o.SellerId = seller.UserId
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin p ON l.PinId = p.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR p.BrandId = b.BrandId)
            WHERE o.OrderId = @orderId
        `);

        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    static async getByUserId(userId, userType = 'all', page = 1, limit = 10) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        const offset = (page - 1) * limit;
        request.input('userId', sql.Int, userId);
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        let whereClause = '';
        if (userType === 'buyer') {
            whereClause = 'WHERE o.BuyerId = @userId';
        } else if (userType === 'seller') {
            whereClause = 'WHERE o.SellerId = @userId';
        } else {
            whereClause = 'WHERE (o.BuyerId = @userId OR o.SellerId = @userId)';
        }

        const result = await request.query(`
            SELECT o.*, l.Title as ListingTitle, l.Price as ListingPrice,
                   l.ListingType, l.Images,
                   buyer.FullName as BuyerName, buyer.Email as BuyerEmail,
                   seller.FullName as SellerName, seller.Email as SellerEmail,
                   c.Model as CarModel, c.Year as CarYear, c.BatteryCapacity, c.Kilometers,
                   p.Model as PinModel, p.Capacity as PinCapacity, p.ManufactureYear,
                   b.BrandName
            FROM [Order] o
            LEFT JOIN Listing l ON o.ListingId = l.ListingId
            LEFT JOIN [User] buyer ON o.BuyerId = buyer.UserId
            LEFT JOIN [User] seller ON o.SellerId = seller.UserId
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin p ON l.PinId = p.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR p.BrandId = b.BrandId)
            ${whereClause}
            ORDER BY o.CreatedDate DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

        return result.recordset;
    }

    static async updateStatus(orderId, status) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('orderId', sql.Int, orderId);
        request.input('status', sql.NVarChar(20), status);

        const result = await request.query(`
            UPDATE [Order] 
            SET OrderStatus = @status
            WHERE OrderId = @orderId
            SELECT * FROM [Order] WHERE OrderId = @orderId
        `);

        return result.recordset.length > 0 ? new Order(result.recordset[0]) : null;
    }

    static async getAll(page = 1, limit = 10, status = null) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        const offset = (page - 1) * limit;
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);
        
        let whereClause = '';
        if (status) {
            request.input('status', sql.NVarChar(20), status);
            whereClause = 'WHERE o.OrderStatus = @status';
        }

        const result = await request.query(`
            SELECT o.*, l.Title as ListingTitle, l.Price as ListingPrice,
                   l.ListingType, l.Images,
                   buyer.FullName as BuyerName, buyer.Email as BuyerEmail,
                   seller.FullName as SellerName, seller.Email as SellerEmail,
                   c.Model as CarModel, c.Year as CarYear, c.BatteryCapacity, c.Kilometers,
                   p.Model as PinModel, p.Capacity as PinCapacity, p.ManufactureYear,
                   b.BrandName
            FROM [Order] o
            LEFT JOIN Listing l ON o.ListingId = l.ListingId
            LEFT JOIN [User] buyer ON o.BuyerId = buyer.UserId
            LEFT JOIN [User] seller ON o.SellerId = seller.UserId
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin p ON l.PinId = p.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR p.BrandId = b.BrandId)
            ${whereClause}
            ORDER BY o.CreatedDate DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

        return result.recordset;
    }

    static async getTotalCount(status = null) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        let whereClause = '';
        if (status) {
            request.input('status', sql.NVarChar(20), status);
            whereClause = 'WHERE OrderStatus = @status';
        }

        const result = await request.query(`
            SELECT COUNT(*) as total FROM [Order] ${whereClause}
        `);

        return result.recordset[0].total;
    }
}

module.exports = Order;
