CREATE TYPE "public"."contact_status" AS ENUM('new', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TABLE "contact_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"email" varchar(256) NOT NULL,
	"subject" varchar(256),
	"category" varchar(128),
	"message" text NOT NULL,
	"status" "contact_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_contact_email" ON "contact_queries" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_contact_status" ON "contact_queries" USING btree ("status");