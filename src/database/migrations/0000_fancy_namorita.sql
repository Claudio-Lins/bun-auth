CREATE TABLE "accounts" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batches" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
CREATE TABLE "event_units" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"popcorn_unit_id" text NOT NULL,
	"allocated_at" timestamp DEFAULT now() NOT NULL,
	"released_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"event_date" timestamp NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"image_url" text,
	"status" text NOT NULL,
	"internal_owner_id" text NOT NULL,
	"allocated_units" integer DEFAULT 0 NOT NULL,
	"max_sales_capacity" integer,
	"event_price" numeric(10, 2) DEFAULT '0',
	"transport_cost" numeric(10, 2),
	"food_cost" numeric(10, 2),
	"rating" integer,
	"rating_comment" text,
	"address_street" text,
	"address_number" text,
	"address_city" text,
	"address_state" text,
	"address_postal_code" text,
	"address_country" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkeys" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp,
	"aaguid" text
);
--> statement-breakpoint
CREATE TABLE "popcorn_units" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prefix" text,
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
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user_addresses" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"street" text NOT NULL,
	"number" text,
	"complement" text,
	"neighborhood" text NOT NULL,
	"city" text NOT NULL,
	"state" text,
	"postal_code" text NOT NULL,
	"country" text DEFAULT 'PT',
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_contacts" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"phone" text NOT NULL,
	"country_code" text DEFAULT '351',
	"is_primary" boolean DEFAULT false NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'user',
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_units" ADD CONSTRAINT "event_units_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_units" ADD CONSTRAINT "event_units_popcorn_unit_id_popcorn_units_id_fk" FOREIGN KEY ("popcorn_unit_id") REFERENCES "public"."popcorn_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkeys" ADD CONSTRAINT "passkeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popcorn_units" ADD CONSTRAINT "popcorn_units_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_contacts" ADD CONSTRAINT "user_contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "batches_product_variant_id_idx" ON "batches" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "batches_production_date_idx" ON "batches" USING btree ("production_date");--> statement-breakpoint
CREATE INDEX "event_units_popcorn_unit_id_idx" ON "event_units" USING btree ("popcorn_unit_id");--> statement-breakpoint
CREATE INDEX "event_units_event_id_idx" ON "event_units" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_units_released_at_idx" ON "event_units" USING btree ("released_at");--> statement-breakpoint
CREATE INDEX "event_units_availability_idx" ON "event_units" USING btree ("popcorn_unit_id","released_at");--> statement-breakpoint
CREATE INDEX "passkeys_userId_idx" ON "passkeys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "passkeys_credentialID_idx" ON "passkeys" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "popcorn_units_batch_id_idx" ON "popcorn_units" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "popcorn_units_sku_idx" ON "popcorn_units" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "popcorn_units_status_idx" ON "popcorn_units" USING btree ("sold","is_available");--> statement-breakpoint
CREATE INDEX "product_variants_product_id_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variants_sku_idx" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "user_addresses_user_id_idx" ON "user_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_contacts_user_id_idx" ON "user_contacts" USING btree ("user_id");