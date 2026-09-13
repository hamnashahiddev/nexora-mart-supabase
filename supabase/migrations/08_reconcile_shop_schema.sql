-- Migration 08: Reconcile Shop Schema
-- This script creates the missing tables for the store while strictly preserving the existing clients and orders tables.

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Order Items Table
-- Relates exactly to the existing orders table (which has an int8 primary key)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id INT8 NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products Policies: Public can view active products, Admins can do everything
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Order Items Policies: Users can view and insert their own order items
CREATE POLICY "Users can insert their own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create a secure RPC to handle checkout atomically (server-side calculation and stock decrement)
CREATE OR REPLACE FUNCTION public.place_order(
  p_address TEXT,
  p_zip_code TEXT,
  p_city TEXT,
  p_name TEXT,
  p_items JSONB -- Array of { product_id: UUID, quantity: INTEGER }
)
RETURNS INT8
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_order_id INT8;
  v_total_price NUMERIC := 0;
  v_item JSONB;
  v_product_price NUMERIC;
  v_product_stock INTEGER;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Calculate total price and lock stock rows
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Lock the product row to prevent race conditions during checkout
    SELECT price, stock INTO v_product_price, v_product_stock
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item->>'product_id';
    END IF;

    IF v_product_stock < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item->>'product_id';
    END IF;

    v_total_price := v_total_price + (v_product_price * (v_item->>'quantity')::INTEGER);
  END LOOP;

  -- 2. Insert into the exact existing orders table schema
  INSERT INTO public.orders (user_id, price, address, zip_code, city, name, created_at)
  VALUES (v_user_id, v_total_price, p_address, p_zip_code, p_city, p_name, NOW())
  RETURNING id INTO v_order_id;

  -- 3. Insert order items and decrement stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Get price again (or we could have cached it, but this is fine in a transaction)
    SELECT price INTO v_product_price
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID;

    -- Insert item
    INSERT INTO public.order_items (order_id, product_id, quantity, price, created_at)
    VALUES (
      v_order_id, 
      (v_item->>'product_id')::UUID, 
      (v_item->>'quantity')::INTEGER, 
      v_product_price,
      NOW()
    );

    -- Decrement stock
    UPDATE public.products
    SET stock = stock - (v_item->>'quantity')::INTEGER,
        updated_at = NOW()
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;

  RETURN v_order_id;
END;
$$;
