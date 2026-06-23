ALTER TABLE "safety_certifications" RENAME TO "registrations";--> statement-breakpoint
ALTER TABLE "registrations" RENAME COLUMN "cert_date" TO "registration_date";--> statement-breakpoint
ALTER TABLE "registrations" RENAME COLUMN "inspector" TO "registration_number";--> statement-breakpoint
ALTER TABLE "registrations" DROP COLUMN "result";--> statement-breakpoint
ALTER TABLE "registrations" RENAME CONSTRAINT "safety_certifications_pkey" TO "registrations_pkey";--> statement-breakpoint
ALTER TABLE "registrations" RENAME CONSTRAINT "safety_certifications_car_id_cars_id_fk" TO "registrations_car_id_cars_id_fk";--> statement-breakpoint
ALTER TABLE "registrations" RENAME CONSTRAINT "safety_certifications_created_by_id_user_id_fk" TO "registrations_created_by_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "registrations" RENAME CONSTRAINT "safety_certifications_document_id_documents_id_fk" TO "registrations_document_id_documents_id_fk";--> statement-breakpoint
ALTER INDEX "safety_certs_car_expiry_idx" RENAME TO "registrations_car_expiry_idx";--> statement-breakpoint
DROP TYPE "public"."cert_result";
