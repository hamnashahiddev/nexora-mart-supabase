import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import { Package, ArrowRight } from 'lucide-react';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, image_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      addNotification('Failed to load orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="page-container flex-center" style={{minHeight: '60vh'}}><Spinner /></div>;
  }

  if (orders.length === 0) {
    return (
      <div className="page-container flex-center" style={{minHeight: '60vh'}}>
        <EmptyState 
          icon={Package}
          title="No orders yet"
          message="You haven't placed any orders yet."
          actionLabel="Start Shopping"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="page-container" style={{maxWidth: '900px'}}>
      <h1 className="mb-8">My Orders</h1>
      
      <div className="orders-list flex-col gap-6">
        {orders.map(order => (
          <div key={order.id} className="order-card p-6 bg-white border rounded-lg shadow-sm">
            <div className="order-card-header flex-between mb-4 border-b pb-4">
              <div>
                <div className="text-muted small">Order Placed</div>
                <div className="font-medium">{new Date(order.created_at).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-muted small">Total</div>
                <div className="font-medium">${order.total_amount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted small">Order #</div>
                <div className="font-medium">{order.order_number}</div>
              </div>
              <div className="text-right">
                <span className={`status-badge ${
                  order.status === 'Delivered' ? 'success' : 
                  order.status === 'Cancelled' ? 'danger' : 'warning'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
            
            <div className="order-items-list mt-4">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex gap-4 mb-4 items-center">
                  <img 
                    src={item.products?.image_url} 
                    alt={item.products?.name} 
                    style={{width: 60, height: 60, objectFit: 'cover', borderRadius: 4}}
                  />
                  <div className="flex-1">
                    <Link to={`/product/${item.product_id}`} className="font-medium hover:text-accent">
                      {item.products?.name}
                    </Link>
                    <div className="text-muted small">Qty: {item.quantity} • ${item.price_at_time.toFixed(2)}</div>
                  </div>
                  <button className="btn btn-outline small">Write Review</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
