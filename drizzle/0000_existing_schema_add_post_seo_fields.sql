-- Baseline for the schema previously managed with drizzle-kit push.
-- This repository begins migration history with the additive API v1 change.
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "seo_title" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "seo_description" text;
