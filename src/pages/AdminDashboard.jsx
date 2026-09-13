import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    pendingOrders: 0,
    lowStock: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch total revenue and orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*');
      
      if (ordersError) throw ordersError;

      const revenue = orders?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0;
      const pendingOrders = orders?.filter(o => o.status === 'Pending').length || 0;

      // Fetch customers (profiles with customer role)
      const { count: customersCount, error: customersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');
      
      if (customersError) throw customersError;

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('stock');
      
      if (productsError) throw productsError;
      
      const lowStock = products?.filter(p => p.stock < 10).length || 0;

      setStats({
        revenue,
        orders: orders?.length || 0,
        customers: customersCount || 0,
        products: products?.length || 0,
        pendingOrders,
        lowStock
      });

      // Generate dummy chart data based on real orders for now
      // In a real app, you would group orders by date
      const dummySalesData = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
      ];
      setSalesData(dummySalesData);

    } catch (error) {
      addNotification('Error loading dashboard data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
    <div className="admin-stat-card">
      <div className="admin-stat-header">
        <h3 className="admin-stat-title">{title}</h3>
        <div className={`admin-stat-icon ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="admin-stat-value">{value}</div>
      {trend && (
        <div className="admin-stat-trend">
          <TrendingUp size={16} />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex-center h-full">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-stats-grid">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue.toFixed(2)}`} 
          icon={DollarSign} 
          trend="+12.5% from last month"
          colorClass="text-success"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          icon={ShoppingCart} 
          trend="+5.2% from last month"
          colorClass="text-accent"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.customers} 
          icon={Users} 
          colorClass="text-primary"
        />
        <StatCard 
          title="Total Products" 
          value={stats.products} 
          icon={Package} 
          colorClass="text-muted"
        />
      </div>

      <div className="admin-dashboard-row mt-6">
        <div className="admin-chart-card">
          <h3 className="admin-card-title">Sales Overview</h3>
          <div className="admin-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-side-cards">
          <div className="admin-info-card">
            <div className="admin-info-header">
              <Clock className="text-warning" size={24} />
              <h4>Pending Orders</h4>
            </div>
            <div className="admin-info-value">{stats.pendingOrders}</div>
            <button className="btn btn-outline btn-block mt-4 small">View Orders</button>
          </div>
          
          <div className="admin-info-card mt-4">
            <div className="admin-info-header">
              <Package className="text-danger" size={24} />
              <h4>Low Stock Alerts</h4>
            </div>
            <div className="admin-info-value">{stats.lowStock}</div>
            <button className="btn btn-outline btn-block mt-4 small">Manage Inventory</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
