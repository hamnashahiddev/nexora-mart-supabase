import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/RecoverPassword';
import ResetPassword from './pages/UpdatePassword';

import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Placeholders for Pages to be built
const Home = () => <div className="page-container"><h1>Home</h1><p>Welcome to Nexora Mart</p></div>;
const Categories = () => <div className="page-container"><h1>Categories</h1></div>;
const Profile = () => <div className="page-container"><h1>My Profile</h1></div>;
const Orders = () => <div className="page-container"><h1>My Orders</h1></div>;
const NotFound = () => <div className="page-container flex-center flex-col h-full"><h1>404</h1><p>Looks like you've wandered off the shopping path.</p></div>;

import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminCategories from './pages/AdminCategories';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <Routes>
      {/* Public Routes with Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute requireAdmin={true} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>

      {/* Auth Routes with Auth Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/recover-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<ResetPassword />} />
      </Route>
    </Routes>
  );
}

export default App;
