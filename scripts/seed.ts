import { config } from 'dotenv';
config({ path: '.env.local' });

// We need to defer import of db because it checks process.env.DATABASE_URL at top level
// and imports are hoisted.

async function seedDatabase() {
    console.log('🌱 Seeding database with mock data...\n');

    // Dynamic imports to ensure env vars are loaded first
    const { db } = await import('../lib/db');
    const { categories, customers, products } = await import('../lib/schema');
    const { eq } = await import('drizzle-orm');

    // Mock customers data
    const mockCustomers = [
        {
            name: 'Acme Corporation',
            email: 'contact@acmecorp.com',
            phone: '+1 (555) 123-4567',
            address: '123 Business Park, Suite 400, New York, NY 10001',
            company: 'Acme Corporation',
            notes: 'Enterprise client, priority support'
        },
        {
            name: 'TechStart Solutions',
            email: 'hello@techstart.io',
            phone: '+1 (555) 987-6543',
            address: '456 Innovation Drive, San Francisco, CA 94105',
            company: 'TechStart Solutions Inc.',
            notes: 'Startup, prefers monthly billing'
        }
    ];

    // Mock products data
    const mockProducts = [
        {
            sku: 'HW-LAPTOP-001',
            name: 'Professional Laptop Pro 15"',
            description: 'High-performance laptop with 16GB RAM, 512GB SSD, Intel i7 processor',
            unit_price: 1299.99,
            category_id: 1 // Hardware (assuming category id 1 exists)
        },
        {
            sku: 'HW-MONITOR-002',
            name: '4K Ultra HD Monitor 27"',
            description: '27-inch 4K UHD display with HDR support, USB-C connectivity',
            unit_price: 449.99,
            category_id: 1 // Hardware
        },
        {
            sku: 'SW-LICENSE-001',
            name: 'Enterprise Software Suite',
            description: 'Annual license for productivity suite including email, docs, and cloud storage',
            unit_price: 299.99,
            category_id: 2 // Software (assuming category id 2 exists)
        }
    ];

    // Seed Categories
    console.log('📁 Adding categories...');
    const defaultCategories = ['Hardware', 'Software'];
    for (const catName of defaultCategories) {
        try {
            await db.insert(categories).values({ name: catName }).onConflictDoNothing();
            console.log(`  ✅ Ensured category: ${catName}`);
        } catch (error) {
            console.log(`  ⚠️ Error adding category ${catName}:`, error);
        }
    }

    // Insert customers
    console.log('\n📋 Adding customers...');
    for (const customer of mockCustomers) {
        try {
            const existing = await db.select().from(customers).where(eq(customers.name, customer.name));
            if (existing.length > 0) {
                console.log(`  ⚠️ Skipped (already exists): ${customer.name}`);
                continue;
            }

            await db.insert(customers).values(customer);
            console.log(`  ✅ Added customer: ${customer.name}`);
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            console.log(`  ⚠️ Error: ${customer.name} - ${errMsg}`);
        }
    }

    // Insert products
    console.log('\n📦 Adding products...');
    for (const product of mockProducts) {
        try {
            await db.insert(products).values(product).onConflictDoNothing();
            // Check if exists for logging
            const existing = await db.select().from(products).where(eq(products.sku, product.sku));
            if (existing.length > 0) {
                console.log(`  ✅ Ensured product: ${product.name} (${product.sku})`);
            }
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            console.log(`  ⚠️ Error: ${product.name} - ${errMsg}`);
        }
    }

    console.log('\n✨ Seeding complete!');
    process.exit(0);
}

seedDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
});
