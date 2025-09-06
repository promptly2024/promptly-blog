ALTER TABLE "media" ADD COLUMN "alt_text" varchar(255);--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "width";--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "height";--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "size_bytes";