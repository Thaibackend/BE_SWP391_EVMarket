const { sql } = require('../config/database');

class Payment {
    constructor(data) {
        this.paymentId = data.paymentId;
        this.orderId = data.orderId;
        this.userId = data.userId;
        this.amount = data.amount;
        this.paymentMethod = data.paymentMethod;
        this.paymentDate = data.paymentDate;
        this.status = data.status;
    }

    static async create(paymentData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('orderId', sql.Int, paymentData.orderId);
        request.input('userId', sql.Int, paymentData.userId);
        request.input('amount', sql.Decimal(18,2), paymentData.amount);
        request.input('paymentMethod', sql.NVarChar(30), paymentData.paymentMethod);
        request.input('status', sql.NVarChar(20), paymentData.status || 'Pending');

        const result = await request.query(`
            INSERT INTO Payment (OrderId, UserId, Amount, PaymentMethod, Status)
            OUTPUT INSERTED.PaymentId, INSERTED.OrderId, INSERTED.UserId, 
                   INSERTED.Amount, INSERTED.PaymentMethod, INSERTED.PaymentDate, INSERTED.Status
            VALUES (@orderId, @userId, @amount, @paymentMethod, @status)
        `);

        return new Payment(result.recordset[0]);
    }

    static async findByOrderId(orderId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('orderId', sql.Int, orderId);

        const result = await request.query(`
            SELECT p.*, o.OrderStatus, l.Title as ListingTitle, l.Price as ListingPrice
            FROM Payment p
            LEFT JOIN [Order] o ON p.OrderId = o.OrderId
            LEFT JOIN Listing l ON o.ListingId = l.ListingId
            WHERE p.OrderId = @orderId
            ORDER BY p.PaymentDate DESC
        `);

        return result.recordset;
    }

    static async getByUserId(userId, page = 1, limit = 10) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        const offset = (page - 1) * limit;
        request.input('userId', sql.Int, userId);
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        const result = await request.query(`
            SELECT p.*, o.OrderStatus, l.Title as ListingTitle, l.Price as ListingPrice,
                   l.ListingType, c.Model as CarModel, c.Year as CarYear,
                   pin.Model as PinModel, pin.Capacity as PinCapacity,
                   b.BrandName
            FROM Payment p
            LEFT JOIN [Order] o ON p.OrderId = o.OrderId
            LEFT JOIN Listing l ON o.ListingId = l.ListingId
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin pin ON l.PinId = pin.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR pin.BrandId = b.BrandId)
            WHERE p.UserId = @userId
            ORDER BY p.PaymentDate DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

        return result.recordset;
    }

    static async updateStatus(paymentId, status) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('paymentId', sql.Int, paymentId);
        request.input('status', sql.NVarChar(20), status);

        const result = await request.query(`
            UPDATE Payment 
            SET Status = @status
            WHERE PaymentId = @paymentId
            SELECT * FROM Payment WHERE PaymentId = @paymentId
        `);

        return result.recordset.length > 0 ? new Payment(result.recordset[0]) : null;
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
            whereClause = 'WHERE p.Status = @status';
        }

        const result = await request.query(`
            SELECT p.*, o.OrderStatus, l.Title as ListingTitle, l.Price as ListingPrice,
                   l.ListingType, u.FullName as UserName, u.Email as UserEmail,
                   c.Model as CarModel, c.Year as CarYear,
                   pin.Model as PinModel, pin.Capacity as PinCapacity,
                   b.BrandName
            FROM Payment p
            LEFT JOIN [Order] o ON p.OrderId = o.OrderId
            LEFT JOIN Listing l ON o.ListingId = l.ListingId
            LEFT JOIN [User] u ON p.UserId = u.UserId
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin pin ON l.PinId = pin.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR pin.BrandId = b.BrandId)
            ${whereClause}
            ORDER BY p.PaymentDate DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

        return result.recordset;
    }

    static async getTotalAmount(status = 'Completed') {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('status', sql.NVarChar(20), status);

        const result = await request.query(`
            SELECT SUM(Amount) as totalAmount, COUNT(*) as totalCount
            FROM Payment WHERE Status = @status
        `);

        return result.recordset[0];
    }
}

module.exports = Payment;
