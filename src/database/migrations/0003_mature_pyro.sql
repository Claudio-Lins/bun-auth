CREATE TABLE "event_units" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"popcorn_unit_id" text NOT NULL,
	"allocated_at" timestamp DEFAULT now() NOT NULL,
	"released_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"event_date" timestamp NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"image_url" text,
	"status" text NOT NULL,
	"internal_owner_id" text NOT NULL,
	"allocated_units" integer NOT NULL,
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
ALTER TABLE "event_units" ADD CONSTRAINT "event_units_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_units" ADD CONSTRAINT "event_units_popcorn_unit_id_popcorn_units_id_fk" FOREIGN KEY ("popcorn_unit_id") REFERENCES "public"."popcorn_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_units_popcorn_unit_id_idx" ON "event_units" USING btree ("popcorn_unit_id");--> statement-breakpoint
CREATE INDEX "event_units_event_id_idx" ON "event_units" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_units_released_at_idx" ON "event_units" USING btree ("released_at");--> statement-breakpoint
CREATE INDEX "event_units_availability_idx" ON "event_units" USING btree ("popcorn_unit_id","released_at");