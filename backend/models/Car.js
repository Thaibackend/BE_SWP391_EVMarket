const { sql } = require('../config/database');

class Car {
    constructor(data) {
        this.carId = data.carId;
        this.brandId = data.brandId;
        this.model = data.model;
        this.year = data.year;
        this.batteryCapacity = data.batteryCapacity;
        this.kilometers = data.kilometers;
        this.description = data.description;
        this.status = data.status;
    }

    static async create(carData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('brandId', sql.Int, carData.brandId);
        request.input('model', sql.NVarChar(100), carData.model);
        request.input('year', sql.Int, carData.year);
        request.input('batteryCapacity', sql.Float, carData.batteryCapacity);
        request.input('kilometers', sql.Int, carData.kilometers);
        request.input('description', sql.NVarChar(500), carData.description);
        request.input('status', sql.NVarChar(20), carData.status || 'Active');

        const result = await request.query(`
            INSERT INTO Car (BrandId, Model, Year, BatteryCapacity, Kilometers, Description, Status)
            OUTPUT INSERTED.CarId, INSERTED.BrandId, INSERTED.Model, INSERTED.Year, 
                   INSERTED.BatteryCapacity, INSERTED.Kilometers, INSERTED.Description, INSERTED.Status
            VALUES (@brandId, @model, @year, @batteryCapacity, @kilometers, @description, @status)
        `);

        return new Car(result.recordset[0]);
    }

    static async findById(carId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('carId', sql.Int, carId);

        const result = await request.query(`
            SELECT c.CarId, c.BrandId, c.Model, c.Year, c.BatteryCapacity, 
                   c.Kilometers, c.Description, c.Status, b.BrandName
            FROM Car c
            LEFT JOIN Brand b ON c.BrandId = b.BrandId
            WHERE c.CarId = @carId
        `);

        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    static async search(filters = {}) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        let whereConditions = [];
        
        if (filters.brandId) {
            request.input('brandId', sql.Int, filters.brandId);
            whereConditions.push('c.BrandId = @brandId');
        }
        
        if (filters.model) {
            request.input('model', sql.NVarChar(100), `%${filters.model}%`);
            whereConditions.push('c.Model LIKE @model');
        }
        
        if (filters.minYear) {
            request.input('minYear', sql.Int, filters.minYear);
            whereConditions.push('c.Year >= @minYear');
        }
        
        if (filters.maxYear) {
            request.input('maxYear', sql.Int, filters.maxYear);
            whereConditions.push('c.Year <= @maxYear');
        }
        
        if (filters.minBatteryCapacity) {
            request.input('minBatteryCapacity', sql.Float, filters.minBatteryCapacity);
            whereConditions.push('c.BatteryCapacity >= @minBatteryCapacity');
        }
        
        if (filters.maxBatteryCapacity) {
            request.input('maxBatteryCapacity', sql.Float, filters.maxBatteryCapacity);
            whereConditions.push('c.BatteryCapacity <= @maxBatteryCapacity');
        }
        
        if (filters.maxKilometers) {
            request.input('maxKilometers', sql.Int, filters.maxKilometers);
            whereConditions.push('c.Kilometers <= @maxKilometers');
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        const result = await request.query(`
            SELECT c.CarId, c.BrandId, c.Model, c.Year, c.BatteryCapacity, 
                   c.Kilometers, c.Description, c.Status, b.BrandName
            FROM Car c
            LEFT JOIN Brand b ON c.BrandId = b.BrandId
            ${whereClause}
            ORDER BY c.Year DESC, c.BatteryCapacity DESC
        `);

        return result.recordset;
    }

    static async update(carId, updateData) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        
        request.input('carId', sql.Int, carId);
        
        const updateFields = [];
        const allowedFields = ['brandId', 'model', 'year', 'batteryCapacity', 'kilometers', 'description', 'status'];
        
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
            UPDATE Car 
            SET ${updateFields.join(', ')}
            WHERE CarId = @carId
            SELECT CarId, BrandId, Model, Year, BatteryCapacity, Kilometers, Description, Status
            FROM Car WHERE CarId = @carId
        `);

        return result.recordset.length > 0 ? new Car(result.recordset[0]) : null;
    }

    static async delete(carId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('carId', sql.Int, carId);

        const result = await request.query(`
            DELETE FROM Car WHERE CarId = @carId
        `);

        return result.rowsAffected[0] > 0;
    }
}

module.exports = Car;
