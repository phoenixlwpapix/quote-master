ALTER TABLE "orders" ADD COLUMN "shipping_fee" double precision NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "incoterm" text;
