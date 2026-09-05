ALTER TABLE "users" ADD COLUMN "tier" varchar(32) DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "supporter_since" timestamp with time zone;