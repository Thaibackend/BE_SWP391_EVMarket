const { sql } = require('../config/database');

class Brand {
    constructor(data) {
        this.brandId = data.brandId;
        this.brandName = data.brandName;
    }

    static async create(brandName) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('brandName', sql.NVarChar(100), brandName);

        const result = await request.query(`
            INSERT INTO Brand (BrandName)
            OUTPUT INSERTED.BrandId, INSERTED.BrandName
            VALUES (@brandName)
        `);

        return new Brand(result.recordset[0]);
    }

    static async getAll() {
        const pool = require('../config/database').getPool();
        const request = pool.request();

        const result = await request.query(`
            SELECT BrandId, BrandName FROM Brand ORDER BY BrandName
        `);

        return result.recordset.map(brand => new Brand(brand));
    }

    static async findById(brandId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('brandId', sql.Int, brandId);

        const result = await request.query(`
            SELECT BrandId, BrandName FROM Brand WHERE BrandId = @brandId
        `);

        return result.recordset.length > 0 ? new Brand(result.recordset[0]) : null;
    }

    static async update(brandId, brandName) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('brandId', sql.Int, brandId);
        request.input('brandName', sql.NVarChar(100), brandName);

        const result = await request.query(`
            UPDATE Brand 
            SET BrandName = @brandName
            WHERE BrandId = @brandId
            SELECT BrandId, BrandName FROM Brand WHERE BrandId = @brandId
        `);

        return result.recordset.length > 0 ? new Brand(result.recordset[0]) : null;
    }

    static async delete(brandId) {
        const pool = require('../config/database').getPool();
        const request = pool.request();
        request.input('brandId', sql.Int, brandId);

        const result = await request.query(`
            DELETE FROM Brand WHERE BrandId = @brandId
        `);

        return result.rowsAffected[0] > 0;
    }
}

module.exports = Brand;
