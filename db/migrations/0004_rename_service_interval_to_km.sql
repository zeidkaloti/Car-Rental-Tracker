ALTER TABLE "cars" RENAME COLUMN "service_interval_miles" TO "service_interval_km";--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "service_interval_km" SET DEFAULT 8000;
