
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial NOT NULL UNIQUE,
	"fullname" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_active" boolean NOT NULL DEFAULT true,
	"base_entity_id" int NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "user_roles" (
	"id" serial NOT NULL UNIQUE,
	"user_id" int NOT NULL,
	"role_id" int NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "items" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"section_id" int NOT NULL,
	"price" decimal NOT NULL,
	"image_id" int,
	"description" text(65535),
	"base_entity_id" int NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "sections" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"base_entity_id" int NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "receipt" (
	"id" serial NOT NULL UNIQUE,
	"number" int NOT NULL,
	"is_delivery" boolean NOT NULL DEFAULT false,
	"phone_number" varchar(255),
	"location" varchar(255),
	"notes" text(65535),
	"base_entity_id" int NOT NULL,
	PRIMARY KEY("id")
);


CREATE TYPE "status_t" AS ENUM ('pending', 'preparing', 'ready', 'done ');

CREATE TABLE IF NOT EXISTS "receipt_items" (
	"id" serial NOT NULL UNIQUE,
	"receipt_id" int NOT NULL,
	"item_id" int NOT NULL,
	"quantity" decimal NOT NULL,
	"status" status_t NOT NULL DEFAULT 'pending',
	"notes" text(65535),
	"base_entity_id" int NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "delivery_guys" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"phone_number" varchar(255) NOT NULL,
	"base_entity_id" int NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "delivery_receipts" (
	"id" serial NOT NULL UNIQUE,
	"dilvery_guy_id" int NOT NULL,
	"is_paid" boolean NOT NULL DEFAULT false,
	"receipt_id" int NOT NULL,
	PRIMARY KEY("id")
);


CREATE TYPE "type_t" AS ENUM ('amount', 'percentage', 'combo');

CREATE TABLE IF NOT EXISTS "discounts" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"code" varchar(255) NOT NULL UNIQUE,
	"type" type_t NOT NULL,
	"max_receipts" int,
	"amount" decimal,
	"persentage" decimal,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean NOT NULL DEFAULT true,
	"base_entity_id" int NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "discount_items" (
	"id" serial NOT NULL UNIQUE,
	"item_id" int NOT NULL,
	"discount_id" int NOT NULL,
	"min_quantity" decimal NOT NULL DEFAULT 1,
	"base_entity_id" int NOT NULL,
	PRIMARY KEY("id")
);


CREATE TYPE "condition_type_t" AS ENUM ('min_amount', 'day_of_week');

CREATE TABLE IF NOT EXISTS "discount_conditions" (
	"id" serial NOT NULL UNIQUE,
	"discount_id" int NOT NULL,
	"condition_type" condition_type_t NOT NULL,
	"value" varchar(255) NOT NULL,
	"base_entity_id" int NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "receipt_discounts" (
	"id" serial NOT NULL UNIQUE,
	"receipt_id" int NOT NULL,
	"discount_id" int NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "receipt_item_discounts" (
	"id" serial NOT NULL UNIQUE,
	"receipt_item_id" int NOT NULL,
	"discount_id" int NOT NULL,
	"applied_amount" decimal NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "images" (
	"id" serial NOT NULL UNIQUE,
	"path" varchar(255) NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "logs" (
	"id" serial NOT NULL UNIQUE,
	"user_id" int,
	"event" varchar(255) NOT NULL,
	"occurred_at" timestamp NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "base_entity" (
	"id" serial NOT NULL UNIQUE,
	"created_at" timestamp NOT NULL,
	"created_by" int,
	"upadated_at" timestamp,
	"updated_by" int,
	"deleted_at" timestamp,
	"deleted_by" int,
	"isdeleted" boolean NOT NULL DEFAULT false,
	PRIMARY KEY("id")
);


ALTER TABLE "receipt_items"
ADD FOREIGN KEY("base_entity_id") REFERENCES "base_entity"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "user_roles"
ADD FOREIGN KEY("role_id") REFERENCES "roles"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "user_roles"
ADD FOREIGN KEY("user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "sections"
ADD FOREIGN KEY("id") REFERENCES "items"("section_id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "images"
ADD FOREIGN KEY("id") REFERENCES "items"("image_id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "receipt_items"
ADD FOREIGN KEY("receipt_id") REFERENCES "receipt"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "receipt_items"
ADD FOREIGN KEY("item_id") REFERENCES "items"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "delivery_receipts"
ADD FOREIGN KEY("dilvery_guy_id") REFERENCES "delivery_guys"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "delivery_receipts"
ADD FOREIGN KEY("receipt_id") REFERENCES "receipt"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "discount_items"
ADD FOREIGN KEY("item_id") REFERENCES "items"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "discount_items"
ADD FOREIGN KEY("discount_id") REFERENCES "discounts"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "discount_conditions"
ADD FOREIGN KEY("discount_id") REFERENCES "discounts"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "receipt_discounts"
ADD FOREIGN KEY("receipt_id") REFERENCES "receipt"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "receipt_discounts"
ADD FOREIGN KEY("discount_id") REFERENCES "discounts"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "base_entity"
ADD FOREIGN KEY("created_by") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "base_entity"
ADD FOREIGN KEY("updated_by") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "base_entity"
ADD FOREIGN KEY("deleted_by") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "users"
ADD FOREIGN KEY("base_entity_id") REFERENCES "base_entity"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "items"
ADD FOREIGN KEY("base_entity_id") REFERENCES "base_entity"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "receipt"
ADD FOREIGN KEY("base_entity_id") REFERENCES "base_entity"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "delivery_guys"
ADD FOREIGN KEY("base_entity_id") REFERENCES "base_entity"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "sections"
ADD FOREIGN KEY("base_entity_id") REFERENCES "base_entity"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "discounts"
ADD FOREIGN KEY("base_entity_id") REFERENCES "base_entity"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "discount_conditions"
ADD FOREIGN KEY("base_entity_id") REFERENCES "base_entity"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "discount_items"
ADD FOREIGN KEY("base_entity_id") REFERENCES "base_entity"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "logs"
ADD FOREIGN KEY("user_id") REFERENCES "users"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "receipt_item_discounts"
ADD FOREIGN KEY("receipt_item_id") REFERENCES "receipt_items"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "receipt_item_discounts"
ADD FOREIGN KEY("discount_id") REFERENCES "discounts"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;