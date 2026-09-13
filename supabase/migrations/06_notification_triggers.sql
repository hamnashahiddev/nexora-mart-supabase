-- 06_notification_triggers.sql

-- 1. Account creation notification
CREATE OR REPLACE FUNCTION notify_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.id,
    'Welcome to Nexora Mart!',
    'Thank you for creating an account. Start exploring our latest products.',
    'success'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hook into the profiles insert (since profile is created via auth trigger)
CREATE TRIGGER on_profile_created_notify
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE notify_new_user();


-- 2. Order Placed Notification
CREATE OR REPLACE FUNCTION notify_order_placed()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.user_id,
    'Order Placed Successfully',
    'Your order #' || NEW.order_number || ' has been placed and is pending processing.',
    'success'
  );
  
  -- Also notify all admins
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT id, 'New Order Received', 'Order #' || NEW.order_number || ' was just placed for $' || NEW.total_amount, 'info'
  FROM public.profiles 
  WHERE role = 'admin';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_placed_notify
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE notify_order_placed();


-- 3. Order Status Update Notification
CREATE OR REPLACE FUNCTION notify_order_status_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'Order Status Update',
      'Your order #' || NEW.order_number || ' is now ' || NEW.status || '.',
      CASE 
        WHEN NEW.status = 'Delivered' THEN 'success'
        WHEN NEW.status = 'Cancelled' THEN 'error'
        ELSE 'info'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_status_update_notify
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE PROCEDURE notify_order_status_update();


-- 4. Low Stock Notification for Admins
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock < 10 AND OLD.stock >= 10 THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT id, 'Low Stock Alert', 'Product "' || NEW.name || '" (SKU: ' || COALESCE(NEW.sku, 'N/A') || ') is running low on stock (' || NEW.stock || ' remaining).', 'warning'
    FROM public.profiles 
    WHERE role = 'admin';
  END IF;
  
  IF NEW.stock = 0 AND OLD.stock > 0 THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT id, 'Out of Stock Alert', 'Product "' || NEW.name || '" is now out of stock!', 'error'
    FROM public.profiles 
    WHERE role = 'admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_product_stock_update_notify
  AFTER UPDATE OF stock ON public.products
  FOR EACH ROW
  EXECUTE PROCEDURE notify_low_stock();
