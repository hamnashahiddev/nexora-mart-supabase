import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    zip_code: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Redirect guests to login
  useEffect(() => {
    if (user === null) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, navigate]);

  // If logged in, maybe prefill name
  useEffect(() => {
    if (user && user.user_metadata?.full_name && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.user_metadata.full_name }));
    }
  }, [user]);

  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className="page-container flex-center flex-col" style={{ minHeight: '60vh', gap: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Checkout Unavailable</h1>
        <p style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>You have no items in your cart to checkout.</p>
        <Link to="/shop" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (!formData.name || !formData.address || !formData.city || !formData.zip_code) {
        throw new Error('Please fill in all customer information fields.');
      }

      // Format items for the RPC
      const itemsPayload = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));

      // Call the secure RPC to place order (calculates totals, decrements stock atomically)
      const { data: newOrderId, error: rpcError } = await supabase.rpc('place_order', {
        p_address: formData.address,
        p_zip_code: formData.zip_code,
        p_city: formData.city,
        p_name: formData.name,
        p_items: itemsPayload
      });

      if (rpcError) {
        throw new Error(rpcError.message || 'Failed to place order.');
      }

      // Success
      setOrderId(newOrderId);
      clearCart();
      setIsSuccess(true);
      
    } catch (error) {
      console.error('Checkout error:', error);
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="page-container flex-center flex-col" style={{ minHeight: '60vh', gap: '1.5rem', textAlign: 'center' }}>
        <CheckCircle size={64} className="text-success mb-4" />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Order Placed Successfully!</h1>
        <p style={{ color: 'var(--text-main)', fontSize: '1.25rem', marginBottom: '2rem' }}>
          Thank you for your order, {formData.name}.<br />
          Your order #{orderId} has been created successfully.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/orders" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
            View My Orders
          </Link>
          <Link to="/shop" className="btn btn-outline" style={{ padding: '1rem 2rem' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Checkout</h1>

      {errorMsg && (
        <div className="alert alert-danger mb-8 flex-center gap-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '1rem', borderRadius: '4px' }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem', alignItems: 'start' }}>
        
        {/* Customer Info Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Customer Information</h2>
          <form id="checkout-form" onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="name" style={{ fontWeight: 'bold' }}>Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="address" style={{ fontWeight: 'bold' }}>Street Address</label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                disabled={isLoading}
                required
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="city" style={{ fontWeight: 'bold' }}>City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="zip_code" style={{ fontWeight: 'bold' }}>ZIP Code</label>
                <input
                  id="zip_code"
                  name="zip_code"
                  type="text"
                  value={formData.zip_code}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem' }}
                />
              </div>
            </div>

          </form>
        </div>

        {/* Order Summary */}
        <div className="card" style={{ padding: '2rem', position: 'sticky', top: '2rem', backgroundColor: '#f9fafb' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '1rem' }}>
            {cartItems.map((item) => (
              <div key={item.id} className="flex-between align-center" style={{ gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.product.name}</div>
                  <div style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 'bold' }}>
                  ${(Number(item.product.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <div className="flex-between">
              <span style={{ color: 'var(--text-main)' }}>Subtotal</span>
              <span style={{ fontWeight: 'bold' }}>${Number(cartTotal).toFixed(2)}</span>
            </div>
            <div className="flex-between">
              <span style={{ color: 'var(--text-main)' }}>Shipping</span>
              <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>Free</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }} />
            <div className="flex-between" style={{ fontSize: '1.5rem' }}>
              <span style={{ fontWeight: 'bold' }}>Total</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>${Number(cartTotal).toFixed(2)}</span>
            </div>
          </div>

          <button 
            type="submit"
            form="checkout-form"
            className="btn btn-primary btn-block" 
            style={{ padding: '1rem', fontSize: '1.25rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="spinner-icon" size={24} /> : <><CreditCard size={24} /> Place Order</>}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-main)' }}>
            By placing your order, you agree to our Terms of Service and Privacy Policy. Payments are securely processed.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
