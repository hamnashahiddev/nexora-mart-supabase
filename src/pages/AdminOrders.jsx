import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import { Search, Filter, Eye } from 'lucide-react';
import Spinner from '../components/Spinner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles:user_id(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      addNotification('Order status updated', 'success');
      
      // In a real app, this would also trigger a notification to the customer via Realtime
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header flex-between mb-6">
        <div className="admin-page-actions flex gap-4">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search orders, customers..." 
              className="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-outline flex-center gap-2">
            <Filter size={18} /> Filter Status
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        {isLoading ? (
          <Spinner className="p-12" />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-muted">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{fontWeight: 500}}>#{order.order_number}</td>
                    <td>
                      <div>{order.profiles?.full_name || 'Guest'}</div>
                      <div className="text-muted small">{order.profiles?.email}</div>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td style={{fontWeight: 600}}>${order.total_amount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${order.payment_status === 'Paid' ? 'success' : 'warning'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`status-select ${order.status.toLowerCase()}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn-icon text-accent" title="View Details"><Eye size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
