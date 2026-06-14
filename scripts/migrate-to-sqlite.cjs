// Explicitly set DATABASE_URL
process.env.DATABASE_URL = 'file:./dev.db';

const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// __dirname is desktop-bundle/backend
const envPath = path.join(__dirname, '..', '..', '..', 'backend', '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

async function migrateData() {
    console.log('🔄 جلب البيانات من PostgreSQL...');
    
    // Connect to PostgreSQL using pg
    const pgPool = new Pool({
        connectionString: envConfig.DATABASE_URL
    });

    try {
        // Fetch categories and products from Postgres
        const categoriesResult = await pgPool.query('SELECT * FROM "Category"');
        const categories = categoriesResult.rows;
        
        const productsResult = await pgPool.query('SELECT * FROM "Product"');
        const products = productsResult.rows;

        const usersResult = await pgPool.query('SELECT * FROM "User"');
        const users = usersResult.rows;

        console.log(`📦 تم العثور على ${categories.length} قسم و ${products.length} منتج و ${users.length} مستخدم.`);

        const sqlite = new Database('./dev.db');

        console.log('📝 حقن البيانات في SQLite (Raw SQL)...');

        sqlite.exec('BEGIN TRANSACTION');

        // Insert categories
        const insertCategory = sqlite.prepare(`
            INSERT OR REPLACE INTO Category (id, name, description, image, isActive, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const cat of categories) {
            insertCategory.run(
                cat.id, cat.name, cat.description, cat.image, 
                cat.isActive ? 1 : 0, 
                cat.createdAt.getTime(), 
                cat.updatedAt.getTime()
            );
        }

        // Insert users
        const insertUser = sqlite.prepare(`
            INSERT OR REPLACE INTO User (id, name, email, password, phone, role, address, isActive, monthlyHourlyRate, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const user of users) {
             insertUser.run(
                user.id, user.name, user.email, user.password, user.phone, 
                user.role || 'customer', user.address, 
                user.isActive ? 1 : 0, 
                user.monthlyHourlyRate || 0,
                user.createdAt.getTime(), 
                user.updatedAt.getTime()
             );
        }

        // Insert products
        const insertProduct = sqlite.prepare(`
            INSERT OR REPLACE INTO Product (id, name, scientificName, barcode, description, image, categoryId, purchasingPrice, sellingPrice, stockQuantity, minStockAlert, expiryDate, requiresPrescription, isAvailableOnline, unit, supplierId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const prod of products) {
            insertProduct.run(
                prod.id, prod.name, prod.scientificName, prod.barcode, prod.description, prod.image, 
                prod.categoryId, prod.purchasingPrice, prod.sellingPrice, prod.stockQuantity, 
                prod.minStockAlert, 
                prod.expiryDate ? prod.expiryDate.getTime() : null, 
                prod.requiresPrescription ? 1 : 0, 
                prod.isAvailableOnline ? 1 : 0, 
                prod.unit, prod.supplierId, 
                prod.createdAt ? prod.createdAt.getTime() : null, 
                prod.updatedAt ? prod.updatedAt.getTime() : null
            );
        }

        sqlite.exec('COMMIT');

        console.log('✅ اكتمل حقن البيانات بنجاح!');
        sqlite.close();
    } catch (error) {
        console.error('❌ حدث خطأ أثناء نقل البيانات:', error);
    } finally {
        await pgPool.end();
    }
}

migrateData();
