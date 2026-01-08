ALTER TABLE "orders" DROP CONSTRAINT "orders_order_number_unique";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_sku_unique";--> statement-breakpoint
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_quote_number_unique";--> statement-breakpoint
ALTER TABLE "neon_auth"."account" DROP CONSTRAINT "account_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "company_settings" DROP CONSTRAINT "company_settings_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "customers" DROP CONSTRAINT "customers_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "neon_auth"."session" DROP CONSTRAINT "session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "company_settings" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "user_id" text;