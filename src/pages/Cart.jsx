import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft, AlertCircle, Minus, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState('');

  const handleUpdateQuantity = async (productId, newQuantity) => {
    setActionError('');
    const { error } = await updateQuantity(productId, newQuantity);
    if (error) {
      setActionError(error.message);
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      // Direct them to login but remember they wanted to checkout
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-container flex-center flex-col" style={{ minHeight: '60vh', gap: '2rem' }}>
        <div style={{ padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '50%', color: '#9ca3af' }}>
          <ShoppingCart size={64} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Your cart is empty</h1>
        <p style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/shop" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div className="flex-between align-center mb-8">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Your Cart ({cartCount} items)</h1>
        <Link to="/shop" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>

      {actionError && (
        <div className="alert alert-danger mb-8 flex-center gap-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '1rem', borderRadius: '4px' }}>
          <AlertCircle size={20} />
          <span>{actionError}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', alignItems: 'start' }}>
        
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cartItems.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', alignItems: 'center' }}>
              
              <div style={{ width: '100px', height: '100px', backgroundColor: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="flex-center" style={{ width: '100%', height: '100%', color: '#9ca3af', fontSize: '0.875rem' }}>No Img</div>
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to={`/product/${item.product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{item.product.name}</h3>
                </Link>
                <div style={{ color: 'var(--text-main)', opacity: 0.8, fontSize: '0.875rem' }}>
                  Price: ${Number(item.product.price).toFixed(2)}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  ${(Number(item.product.price) * item.quantity).toFixed(2)}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {/* Quantity */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' }}>
                    <button 
                      style={{ padding: '0.5rem', backgroundColor: 'white', border: 'none', cursor: 'pointer' }}
                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <div style={{ padding: '0.5rem 1rem', backgroundColor: 'white', minWidth: '2.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>
                      {item.quantity}
                    </div>
                    <button 
                      style={{ padding: '0.5rem', backgroundColor: 'white', border: 'none', cursor: 'pointer' }}
                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Trash2 size={18} /> <span style={{ fontSize: '0.875rem' }}>Remove</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <div className="flex-between">
              <span style={{ color: 'var(--text-main)' }}>Subtotal ({cartCount} items)</span>
              <span style={{ fontWeight: 'bold' }}>${Number(cartTotal).toFixed(2)}</span>
            </div>
            <div className="flex-between">
              <span style={{ color: 'var(--text-main)' }}>Shipping</span>
              <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>Free</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }} />
            <div className="flex-between" style={{ fontSize: '1.25rem' }}>
              <span style={{ fontWeight: 'bold' }}>Total</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>${Number(cartTotal).toFixed(2)}</span>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-block" 
            style={{ padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            onClick={handleCheckout}
          >
            Proceed to Checkout <ArrowRight size={20} />
          </button>
          
          {!user && (
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              You will be asked to sign in or create an account before placing your order.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Cart;
