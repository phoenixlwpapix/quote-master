-- Clean up old data that doesn't belong to any user (user_id IS NULL)
-- Run this in Neon Console SQL Editor

-- 1. Delete order items for orphan orders
DELETE FROM "order_items" 
WHERE "order_id" IN (SELECT "id" FROM "orders" WHERE "user_id" IS NULL);

-- 2. Delete orphan orders
DELETE FROM "orders" WHERE "user_id" IS NULL;

-- 3. Delete quote items for orphan quotes
DELETE FROM "quote_items" 
WHERE "quote_id" IN (SELECT "id" FROM "quotes" WHERE "user_id" IS NULL);

-- 4. Delete orphan quotes
DELETE FROM "quotes" WHERE "user_id" IS NULL;

-- 5. Delete orphan products
-- (After deleting dependent items above, this should be safe)
DELETE FROM "products" WHERE "user_id" IS NULL;

-- 6. Delete orphan customers
DELETE FROM "customers" WHERE "user_id" IS NULL;

-- 7. Delete orphan company settings
DELETE FROM "company_settings" WHERE "user_id" IS NULL;
