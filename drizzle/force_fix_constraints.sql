-- 强制修复唯一约束
-- 运行此脚本以确保全局唯一约束被移除

-- 1. 显式删除旧的唯一约束 (如果存在)
ALTER TABLE "quotes" DROP CONSTRAINT IF EXISTS "quotes_quote_number_unique";
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_order_number_unique";
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_sku_unique";

-- 2. 也是删除索引 (有时约束实际上是唯一索引)
DROP INDEX IF EXISTS "quotes_quote_number_unique";
DROP INDEX IF EXISTS "orders_order_number_unique";
DROP INDEX IF EXISTS "products_sku_unique";

-- 3. 重新创建复合唯一索引 (user_id + number)
-- 使用 CONCURRENTLY 避免锁表（如果在无事务块中运行）
-- 注意：如果 user_id 为 NULL，PostgreSQL 默认不认为它们相等，这很好。

CREATE UNIQUE INDEX IF NOT EXISTS "idx_uniq_quotes_user_number" 
ON "quotes" ("user_id", "quote_number") 
WHERE "user_id" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_uniq_orders_user_number" 
ON "orders" ("user_id", "order_number") 
WHERE "user_id" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_uniq_products_user_sku" 
ON "products" ("user_id", "sku") 
WHERE "user_id" IS NOT NULL;
