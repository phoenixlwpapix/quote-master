-- 修复唯一约束 - 改为按用户唯一
-- 在 Neon Console SQL Editor 中运行

-- Step 1: 删除全局唯一约束
ALTER TABLE "quotes" DROP CONSTRAINT IF EXISTS "quotes_quote_number_unique";
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_order_number_unique";

-- Step 2: 添加复合唯一约束 (user_id + number)
-- 注意: 需要先处理 user_id 为 NULL 的旧数据
-- 这里我们允许 NULL user_id 的记录暂时保持（它们不会与新记录冲突）

-- 对于 quotes: 创建部分唯一索引（只对 user_id 不为 NULL 的记录生效）
CREATE UNIQUE INDEX IF NOT EXISTS "quotes_user_quote_number_unique" 
ON "quotes" ("user_id", "quote_number") 
WHERE "user_id" IS NOT NULL;

-- 对于 orders: 创建部分唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS "orders_user_order_number_unique" 
ON "orders" ("user_id", "order_number") 
WHERE "user_id" IS NOT NULL;
