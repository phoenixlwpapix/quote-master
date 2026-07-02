ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "user_id" text;

ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_name_unique";

CREATE UNIQUE INDEX IF NOT EXISTS "categories_user_name_unique"
ON "categories" ("user_id", "name");

CREATE UNIQUE INDEX IF NOT EXISTS "products_user_sku_unique"
ON "products" ("user_id", "sku");

CREATE UNIQUE INDEX IF NOT EXISTS "quotes_user_quote_number_unique"
ON "quotes" ("user_id", "quote_number");

CREATE UNIQUE INDEX IF NOT EXISTS "orders_user_order_number_unique"
ON "orders" ("user_id", "order_number");

CREATE UNIQUE INDEX IF NOT EXISTS "orders_user_quote_unique"
ON "orders" ("user_id", "quote_id");

CREATE UNIQUE INDEX IF NOT EXISTS "company_settings_user_unique"
ON "company_settings" ("user_id");
