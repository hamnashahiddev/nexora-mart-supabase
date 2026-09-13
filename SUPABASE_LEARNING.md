# Supabase Learning Guide: Nexora Mart

This document explains the key Supabase concepts implemented in Nexora Mart. It serves as a practical guide for beginners learning how to build full-stack applications with Supabase and React.

## 1. Database Architecture
Nexora Mart uses a robust relational PostgreSQL database. We have tables for `profiles`, `categories`, `products`, `cart_items`, `orders`, `order_items`, `favorites`, `reviews`, and `notifications`.
**Key concept**: Relationships are defined using Foreign Keys (e.g., `user_id UUID REFERENCES profiles(id)`). This ensures data integrity—you can't have a cart item for a user that doesn't exist.

## 2. Authentication Flow
We use **Supabase Auth** (`auth.users`) to handle identity. 
- When a user signs up, Supabase hashes their password securely and creates a record in `auth.users`.
- We use the `@supabase/supabase-js` library in React (`supabase.auth.signUp`, `supabase.auth.signInWithPassword`) to manage sessions.
- **Session Persistence**: Supabase automatically stores the session token in local storage and attaches it to all subsequent database requests.

## 3. RLS Policies (Row Level Security)
RLS is PostgreSQL's built-in security mechanism. By default, tables with RLS enabled block ALL access. We explicitly define policies to allow access.
**Example:**
```sql
CREATE POLICY "Users can view their own cart" ON cart_items 
  FOR SELECT USING (auth.uid() = user_id);
```
- `auth.uid()` is a special Supabase function that extracts the ID of the currently logged-in user from their JWT.
- This policy ensures that a user querying `cart_items` will only ever receive rows where `user_id` matches their own ID.

## 4. Database Relationships & Profiles
Supabase hides the `auth.users` schema for security reasons. Therefore, we create a public `profiles` table to store public user data (name, avatar, role).
- **Ownership**: The `id` in `profiles` is a foreign key that perfectly matches the `id` in `auth.users`.

## 5. Storage
We use **Supabase Storage** to store files like product images and user avatars in "buckets".
- We created three buckets: `product-images`, `category-images`, and `avatars`.
- We use Storage Policies (similar to RLS) to control who can upload. For instance, only users can upload to their own avatar folder.

## 6. Realtime
Supabase leverages PostgreSQL's logical replication to broadcast changes to connected clients over WebSockets.
- In `01_initial_schema.sql`, we enabled realtime for `orders` and `notifications`: `ALTER PUBLICATION supabase_realtime ADD TABLE orders, notifications;`
- In React, we can subscribe to these changes using `supabase.channel('public:orders').on('postgres_changes', ...).subscribe()`.

## 7. Triggers and Functions
**Triggers** run automatically when a specific database event occurs.
- **Auto-Profile Creation**: We created a function `handle_new_user()` and a trigger `on_auth_user_created` on `auth.users`. When a user signs up, the trigger fires the function, automatically inserting a row into the `profiles` table.
- **Updated At**: We use triggers to automatically update the `updated_at` column whenever a row is modified.

## 8. Admin Authorization
To create a secure admin role without exposing a secret service key:
1. We added a `role` column to the `profiles` table (`customer` or `admin`).
2. We created a secure PostgreSQL function `public.is_admin()` that checks if the current `auth.uid()` has the admin role.
3. We used `public.is_admin()` inside our RLS policies (e.g., `CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (public.is_admin());`).

## 9. Environment Variables
- `VITE_SUPABASE_URL`: The URL to your Supabase instance.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: The safe-to-expose anonymous key. It relies entirely on RLS for security. NEVER expose the `service_role` key in your frontend application.
