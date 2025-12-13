CREATE TABLE "batches" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"product_variant_id" text NOT NULL,
	"production_date" timestamp NOT NULL,
	"expiration_date" timestamp NOT NULL,
	"quantity" numeric(10, 0) NOT NULL,
	"batch_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "popcorn_units" (
	"id" text PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"sold" boolean DEFAULT false NOT NULL,
	"sku" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"return_reason" text,
	"return_date" timestamp,
	"movement_status" text DEFAULT 'in_stock' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"weight" integer,
	"retail_price" numeric(10, 2),
	"partner_price" numeric(10, 2),
	"product_image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"soft_delete" boolean DEFAULT false NOT NULL,
	"sku" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"soft_delete" boolean DEFAULT false NOT NULL,
	"color" text,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popcorn_units" ADD CONSTRAINT "popcorn_units_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "batches_product_variant_id_idx" ON "batches" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "batches_production_date_idx" ON "batches" USING btree ("production_date");--> statement-breakpoint
CREATE INDEX "popcorn_units_batch_id_idx" ON "popcorn_units" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "popcorn_units_sku_idx" ON "popcorn_units" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "popcorn_units_status_idx" ON "popcorn_units" USING btree ("sold","is_available");--> statement-breakpoint
CREATE INDEX "product_variants_product_id_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variants_sku_idx" ON "product_variants" USING btree ("sku");