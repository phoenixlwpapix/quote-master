-- 简化版迁移 - 添加 user_id 列但不加外键约束
-- 在 Neon Console SQL Editor 中运行

-- Add user_id to customers table (no foreign key)
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "user_id" text;

-- Add user_id to products table  
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "user_id" text;

-- Add user_id to quotes table
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "user_id" text;

-- Add user_id to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "user_id" text;

-- Add user_id to company_settings table
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "user_id" text;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_customers_user_id" ON "customers" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_products_user_id" ON "products" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_quotes_user_id" ON "quotes" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "orders" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_company_settings_user_id" ON "company_settings" ("user_id");
