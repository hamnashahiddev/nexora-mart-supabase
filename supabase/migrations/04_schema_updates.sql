-- 04_schema_updates.sql

-- Add missing columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0.0;

-- Add missing columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Cash on Delivery';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';

-- Add unique constraint to SKU if it exists and is populated, but since we just added it, 
-- it's all nulls, so we'll just leave it without a strict UNIQUE constraint for now to avoid migration errors on existing data.
