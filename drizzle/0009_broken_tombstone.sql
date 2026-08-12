ALTER TABLE "payment_logs" ALTER COLUMN "razorpay_order_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_logs" ALTER COLUMN "razorpay_payment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_logs" ADD COLUMN "invoice_number" text;--> statement-breakpoint
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_invoice_number_unique" UNIQUE("invoice_number");