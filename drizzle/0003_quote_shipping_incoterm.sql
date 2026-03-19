ALTER TABLE "quotes" ADD COLUMN "shipping_fee" double precision DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "incoterm" text;
