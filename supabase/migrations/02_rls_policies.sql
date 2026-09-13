-- 02_rls_policies.sql
-- Enable Row Level Security (RLS) on all tables

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ==========================================
-- PROFILES
-- ==========================================
-- Customers can view and update their own profile. Admins can view/update all.
CREATE POLICY "Users can view their own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- ==========================================
-- CATEGORIES
-- ==========================================
-- Publicly readable. Admins can modify.
CREATE POLICY "Categories are publicly readable" ON categories 
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories" ON categories 
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories" ON categories 
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete categories" ON categories 
  FOR DELETE USING (public.is_admin());

-- ==========================================
-- PRODUCTS
-- ==========================================
-- Publicly readable. Admins can modify.
CREATE POLICY "Products are publicly readable" ON products 
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert products" ON products 
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products" ON products 
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete products" ON products 
  FOR DELETE USING (public.is_admin());

-- ==========================================
-- CART ITEMS
-- ==========================================
-- Users can only see and modify their own cart items.
CREATE POLICY "Users can view their own cart" ON cart_items 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart_items 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart_items 
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- ORDERS
-- ==========================================
-- Users can view their own orders. Admins can view/update all.
CREATE POLICY "Users can view their own orders" ON orders 
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own orders" ON orders 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders" ON orders 
  FOR UPDATE USING (public.is_admin());

-- ==========================================
-- ORDER ITEMS
-- ==========================================
-- Users can view order items if they own the order. Admins can view all.
CREATE POLICY "Users can view their own order items" ON order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can insert their own order items" ON order_items 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- ==========================================
-- FAVORITES
-- ==========================================
CREATE POLICY "Users can view their own favorites" ON favorites 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorites 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites 
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- REVIEWS
-- ==========================================
CREATE POLICY "Reviews are publicly readable" ON reviews 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON reviews 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews 
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- ==========================================
-- NOTIFICATIONS
-- ==========================================
CREATE POLICY "Users can view their own notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications 
  FOR UPDATE USING (auth.uid() = user_id);
