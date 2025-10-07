const { sql } = require('../config/database');

class Listing {
    constructor(data) {
        this.listingId = data.listingId;
        this.userId = data.userId;
        this.carId = data.carId;
        this.pinId = data.pinId;
        this.listingType = data.listingType;
        this.title = data.title;
        this.description = data.description;
        this.price = data.price;
        this.images = data.images;
        this.status = data.status;
        this.approved = data.approved;
        this.createdDate = data.createdDate;
    }

    static async create(listingData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('userId', sql.Int, listingData.userId);
        request.input('carId', sql.Int, listingData.carId);
        request.input('pinId', sql.Int, listingData.pinId);
        request.input('listingType', sql.NVarChar(10), listingData.listingType);
        request.input('title', sql.NVarChar(200), listingData.title);
        request.input('description', sql.NVarChar(1000), listingData.description);
        request.input('price', sql.Decimal(18,2), listingData.price);
        request.input('images', sql.NVarChar(sql.MAX), listingData.images);
        request.input('status', sql.NVarChar(20), listingData.status || 'Active');
        request.input('approved', sql.Bit, listingData.approved || 0);

        const result = await request.query(`
            INSERT INTO Listing (UserId, CarId, PinId, ListingType, Title, Description, Price, Images, Status, Approved)
            OUTPUT INSERTED.ListingId, INSERTED.UserId, INSERTED.CarId, INSERTED.PinId, INSERTED.ListingType,
                   INSERTED.Title, INSERTED.Description, INSERTED.Price, INSERTED.Images, INSERTED.Status, 
                   INSERTED.Approved, INSERTED.CreatedDate
            VALUES (@userId, @carId, @pinId, @listingType, @title, @description, @price, @images, @status, @approved)
        `);

        return new Listing(result.recordset[0]);
    }

    static async findById(listingId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('listingId', sql.Int, listingId);

        const result = await request.query(`
            SELECT l.*, u.FullName as SellerName, u.Email as SellerEmail,
                   c.Model as CarModel, c.Year as CarYear, c.BatteryCapacity, c.Kilometers,
                   p.Model as PinModel, p.Capacity as PinCapacity, p.ManufactureYear,
                   b.BrandName
            FROM Listing l
            LEFT JOIN [User] u ON l.UserId = u.UserId
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin p ON l.PinId = p.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR p.BrandId = b.BrandId)
            WHERE l.ListingId = @listingId
        `);

        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    static async search(filters = {}) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        let whereConditions = ['l.Status = \'Active\'', 'l.Approved = 1'];
        
        if (filters.listingType) {
            request.input('listingType', sql.NVarChar(10), filters.listingType);
            whereConditions.push('l.ListingType = @listingType');
        }
        
        if (filters.brandId) {
            request.input('brandId', sql.Int, filters.brandId);
            whereConditions.push('(c.BrandId = @brandId OR p.BrandId = @brandId)');
        }
        
        if (filters.minPrice) {
            request.input('minPrice', sql.Decimal(18,2), filters.minPrice);
            whereConditions.push('l.Price >= @minPrice');
        }
        
        if (filters.maxPrice) {
            request.input('maxPrice', sql.Decimal(18,2), filters.maxPrice);
            whereConditions.push('l.Price <= @maxPrice');
        }
        
        if (filters.minYear) {
            request.input('minYear', sql.Int, filters.minYear);
            whereConditions.push('(c.Year >= @minYear OR p.ManufactureYear >= @minYear)');
        }
        
        if (filters.maxYear) {
            request.input('maxYear', sql.Int, filters.maxYear);
            whereConditions.push('(c.Year <= @maxYear OR p.ManufactureYear <= @maxYear)');
        }
        
        if (filters.minBatteryCapacity) {
            request.input('minBatteryCapacity', sql.Float, filters.minBatteryCapacity);
            whereConditions.push('(c.BatteryCapacity >= @minBatteryCapacity OR p.Capacity >= @minBatteryCapacity)');
        }
        
        if (filters.maxBatteryCapacity) {
            request.input('maxBatteryCapacity', sql.Float, filters.maxBatteryCapacity);
            whereConditions.push('(c.BatteryCapacity <= @maxBatteryCapacity OR p.Capacity <= @maxBatteryCapacity)');
        }
        
        if (filters.maxKilometers) {
            request.input('maxKilometers', sql.Int, filters.maxKilometers);
            whereConditions.push('c.Kilometers <= @maxKilometers');
        }
        
        if (filters.searchTerm) {
            request.input('searchTerm', sql.NVarChar(200), `%${filters.searchTerm}%`);
            whereConditions.push('(l.Title LIKE @searchTerm OR l.Description LIKE @searchTerm OR c.Model LIKE @searchTerm OR p.Model LIKE @searchTerm)');
        }

        const whereClause = 'WHERE ' + whereConditions.join(' AND ');

        const result = await request.query(`
            SELECT l.*, u.FullName as SellerName, u.Email as SellerEmail,
                   c.Model as CarModel, c.Year as CarYear, c.BatteryCapacity, c.Kilometers,
                   p.Model as PinModel, p.Capacity as PinCapacity, p.ManufactureYear,
                   b.BrandName
            FROM Listing l
            LEFT JOIN [User] u ON l.UserId = u.UserId
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin p ON l.PinId = p.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR p.BrandId = b.BrandId)
            ${whereClause}
            ORDER BY l.CreatedDate DESC
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
            SELECT l.*, c.Model as CarModel, c.Year as CarYear, c.BatteryCapacity, c.Kilometers,
                   p.Model as PinModel, p.Capacity as PinCapacity, p.ManufactureYear,
                   b.BrandName
            FROM Listing l
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin p ON l.PinId = p.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR p.BrandId = b.BrandId)
            WHERE l.UserId = @userId
            ORDER BY l.CreatedDate DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `);

        return result.recordset;
    }

    static async update(listingId, updateData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('listingId', sql.Int, listingId);
        
        const updateFields = [];
        const allowedFields = ['title', 'description', 'price', 'images', 'status', 'approved'];
        
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
            UPDATE Listing 
            SET ${updateFields.join(', ')}
            WHERE ListingId = @listingId
            SELECT * FROM Listing WHERE ListingId = @listingId
        `);

        return result.recordset.length > 0 ? new Listing(result.recordset[0]) : null;
    }

    static async delete(listingId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('listingId', sql.Int, listingId);

        const result = await request.query(`
            DELETE FROM Listing WHERE ListingId = @listingId
        `);

        return result.rowsAffected[0] > 0;
    }

    static async getPendingApproval() {
        const pool = require('../config/database').getPool();
        const request = pool.request();

        const result = await request.query(`
            SELECT l.*, u.FullName as SellerName, u.Email as SellerEmail,
                   c.Model as CarModel, c.Year as CarYear, c.BatteryCapacity, c.Kilometers,
                   p.Model as PinModel, p.Capacity as PinCapacity, p.ManufactureYear,
                   b.BrandName
            FROM Listing l
            LEFT JOIN [User] u ON l.UserId = u.UserId
            LEFT JOIN Car c ON l.CarId = c.CarId
            LEFT JOIN Pin p ON l.PinId = p.PinId
            LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR p.BrandId = b.BrandId)
            WHERE l.Approved = 0 AND l.Status = 'Active'
            ORDER BY l.CreatedDate ASC
        `);

        return result.recordset;
    }
}

module.exports = Listing;
