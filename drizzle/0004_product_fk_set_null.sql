-- Make product_id nullable + ON DELETE SET NULL in quote_items and order_items
-- Since product data is denormalized into items (name, sku, price), deleting a product
-- should not break existing quotes or orders.

ALTER TABLE "quote_items" ALTER COLUMN "product_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "quote_items" DROP CONSTRAINT IF EXISTS "quote_items_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_product_id_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
    ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "order_items" ALTER COLUMN "product_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
    ON DELETE set null ON UPDATE no action;
