const { sql } = require('../config/database');

class Pin {
    constructor(data) {
        this.pinId = data.pinId;
        this.brandId = data.brandId;
        this.capacity = data.capacity;
        this.model = data.model;
        this.status = data.status;
        this.manufactureYear = data.manufactureYear;
        this.description = data.description;
    }

    static async create(pinData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('brandId', sql.Int, pinData.brandId);
        request.input('capacity', sql.Float, pinData.capacity);
        request.input('model', sql.NVarChar(100), pinData.model);
        request.input('status', sql.NVarChar(20), pinData.status || 'Active');
        request.input('manufactureYear', sql.Int, pinData.manufactureYear);
        request.input('description', sql.NVarChar(500), pinData.description);

        const result = await request.query(`
            INSERT INTO Pin (BrandId, Capacity, Model, Status, ManufactureYear, Description)
            OUTPUT INSERTED.PinId, INSERTED.BrandId, INSERTED.Capacity, INSERTED.Model, 
                   INSERTED.Status, INSERTED.ManufactureYear, INSERTED.Description
            VALUES (@brandId, @capacity, @model, @status, @manufactureYear, @description)
        `);

        return new Pin(result.recordset[0]);
    }

    static async findById(pinId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('pinId', sql.Int, pinId);

        const result = await request.query(`
            SELECT p.PinId, p.BrandId, p.Capacity, p.Model, p.Status, 
                   p.ManufactureYear, p.Description, b.BrandName
            FROM Pin p
            LEFT JOIN Brand b ON p.BrandId = b.BrandId
            WHERE p.PinId = @pinId
        `);

        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    static async search(filters = {}) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        let whereConditions = [];
        
        if (filters.brandId) {
            request.input('brandId', sql.Int, filters.brandId);
            whereConditions.push('p.BrandId = @brandId');
        }
        
        if (filters.model) {
            request.input('model', sql.NVarChar(100), `%${filters.model}%`);
            whereConditions.push('p.Model LIKE @model');
        }
        
        if (filters.minCapacity) {
            request.input('minCapacity', sql.Float, filters.minCapacity);
            whereConditions.push('p.Capacity >= @minCapacity');
        }
        
        if (filters.maxCapacity) {
            request.input('maxCapacity', sql.Float, filters.maxCapacity);
            whereConditions.push('p.Capacity <= @maxCapacity');
        }
        
        if (filters.minYear) {
            request.input('minYear', sql.Int, filters.minYear);
            whereConditions.push('p.ManufactureYear >= @minYear');
        }
        
        if (filters.maxYear) {
            request.input('maxYear', sql.Int, filters.maxYear);
            whereConditions.push('p.ManufactureYear <= @maxYear');
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        const result = await request.query(`
            SELECT p.PinId, p.BrandId, p.Capacity, p.Model, p.Status, 
                   p.ManufactureYear, p.Description, b.BrandName
            FROM Pin p
            LEFT JOIN Brand b ON p.BrandId = b.BrandId
            ${whereClause}
            ORDER BY p.Capacity DESC, p.ManufactureYear DESC
        `);

        return result.recordset;
    }

    static async update(pinId, updateData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('pinId', sql.Int, pinId);
        
        const updateFields = [];
        const allowedFields = ['brandId', 'capacity', 'model', 'status', 'manufactureYear', 'description'];
        
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
            UPDATE Pin 
            SET ${updateFields.join(', ')}
            WHERE PinId = @pinId
            SELECT PinId, BrandId, Capacity, Model, Status, ManufactureYear, Description
            FROM Pin WHERE PinId = @pinId
        `);

        return result.recordset.length > 0 ? new Pin(result.recordset[0]) : null;
    }

    static async delete(pinId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('pinId', sql.Int, pinId);

        const result = await request.query(`
            DELETE FROM Pin WHERE PinId = @pinId
        `);

        return result.rowsAffected[0] > 0;
    }
}

module.exports = Pin;
