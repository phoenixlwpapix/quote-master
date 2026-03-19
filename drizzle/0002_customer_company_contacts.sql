-- Refactor customers to be company-centric and add contacts table
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "website" text;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "industry" text;
--> statement-breakpoint
CREATE TABLE "contacts" (
    "id" serial PRIMARY KEY NOT NULL,
    "customer_id" integer NOT NULL,
    "user_id" text,
    "name" text NOT NULL,
    "title" text,
    "email" text,
    "phone" text,
    "is_primary" boolean DEFAULT false NOT NULL,
    "notes" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "contacts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE
);
--> statement-breakpoint
-- Migrate: use company as company name if available, otherwise keep name
UPDATE "customers" SET "name" = "company" WHERE "company" IS NOT NULL AND "company" != '';
--> statement-breakpoint
-- Migrate: create contacts from existing person-level data
INSERT INTO "contacts" ("customer_id", "user_id", "name", "email", "phone", "is_primary", "created_at", "updated_at")
SELECT "id", "user_id", "name", "email", "phone", true, COALESCE("created_at", now()), COALESCE("updated_at", now())
FROM "customers"
WHERE "email" IS NOT NULL OR "phone" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "email";
--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "phone";
--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "company";
