-- seed.sql
-- Seed data for Categories and Products

-- Insert Categories
INSERT INTO categories (id, name, slug, description, image_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Electronics', 'electronics', 'Gadgets, devices, and accessories', 'https://images.unsplash.com/photo-1498049794561-7780e7231661'),
('22222222-2222-2222-2222-222222222222', 'Fashion', 'fashion', 'Clothing, shoes, and apparel', 'https://images.unsplash.com/photo-1445205170230-053b83016050'),
('33333333-3333-3333-3333-333333333333', 'Home & Living', 'home-living', 'Furniture, decor, and home essentials', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a'),
('44444444-4444-4444-4444-444444444444', 'Accessories', 'accessories', 'Watches, jewelry, and bags', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083'),
('55555555-5555-5555-5555-555555555555', 'Beauty', 'beauty', 'Skincare, makeup, and wellness', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9'),
('66666666-6666-6666-6666-666666666666', 'Sports', 'sports', 'Fitness equipment and sportswear', 'https://images.unsplash.com/photo-1517649763962-0c623066013b')
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO products (id, category_id, name, slug, description, price, sale_price, image_url, stock, is_active) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Wireless Noise-Cancelling Headphones', 'wireless-headphones', 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.', 299.99, 249.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', 50, true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Smartwatch Series 8', 'smartwatch-series-8', 'Advanced health tracking, water resistance, and cellular connectivity.', 399.00, NULL, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12', 30, true),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Classic Denim Jacket', 'classic-denim-jacket', 'Vintage-wash denim jacket with a relaxed fit. Perfect for any casual outfit.', 89.99, 69.99, 'https://images.unsplash.com/photo-1523381294911-8d3cead13475', 100, true),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Minimalist Cotton T-Shirt', 'minimalist-cotton-tshirt', '100% organic cotton basic t-shirt. Ultra-soft and breathable.', 24.99, NULL, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 200, true),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Mid-Century Modern Sofa', 'mid-century-modern-sofa', 'Comfortable 3-seater sofa with wooden legs and premium fabric upholstery.', 899.00, 799.00, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', 10, true),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Leather Crossbody Bag', 'leather-crossbody-bag', 'Genuine full-grain leather crossbody bag with brass hardware.', 149.50, NULL, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa', 45, true),
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Hydrating Facial Serum', 'hydrating-facial-serum', 'Hyaluronic acid and vitamin C serum for glowing, youthful skin.', 45.00, 35.00, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', 150, true),
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'Pro Yoga Mat', 'pro-yoga-mat', 'Non-slip, eco-friendly yoga mat with alignment lines.', 65.00, NULL, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f', 80, true);
