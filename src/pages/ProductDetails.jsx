import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Loader2, Minus, Plus, AlertCircle } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, cartItems } = useCart();
  const [actionError, setActionError] = useState('');

  // Find how many are already in cart
  const qtyInCart = cartItems.find(item => item.product.id === id)?.quantity || 0;

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/shop');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setActionError('');
    const { error } = await addToCart(product, quantity);
    if (error) {
      setActionError(error.message);
      setTimeout(() => setActionError(''), 3000);
    } else {
      setQuantity(1); // Reset local quantity selector after adding
    }
  };

  if (isLoading || !product) {
    return (
      <div className="page-container flex-center" style={{ minHeight: '60vh' }}>
        <Loader2 className="spinner-icon text-primary" size={48} />
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const maxAvailableToAdd = product.stock - qtyInCart;

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Link to="/shop" className="btn btn-outline mb-8" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      {actionError && (
        <div className="alert alert-danger mb-8 flex-center gap-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '1rem', borderRadius: '4px' }}>
          <AlertCircle size={20} />
          <span>{actionError}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem' }}>
        
        {/* Product Image */}
        <div style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ color: '#9ca3af', fontSize: '1.25rem' }}>No Image Available</div>
          )}
          {isOutOfStock && (
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'var(--danger-color)', color: 'white', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '1rem', fontWeight: 'bold' }}>
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {product.category && (
            <span style={{ textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {product.category}
            </span>
          )}
          
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2' }}>{product.name}</h1>
          
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '2rem' }}>
            ${Number(product.price).toFixed(2)}
          </div>
          
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Description</h3>
            <p style={{ color: 'var(--text-main)', opacity: 0.8, lineHeight: '1.7', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>
              {product.description || 'No description available for this product.'}
            </p>
          </div>

          <div style={{ marginTop: 'auto', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div className="flex-between align-center mb-4">
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Availability:</span>
              <span style={{ fontWeight: 'bold', color: product.stock > 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {qtyInCart > 0 && (
              <div className="mb-4 text-sm" style={{ color: 'var(--primary-color)' }}>
                You already have {qtyInCart} of this item in your cart.
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {/* Quantity Selector */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' }}>
                <button 
                  style={{ padding: '0.75rem 1rem', backgroundColor: 'white', border: 'none', cursor: 'pointer' }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'white', minWidth: '3rem', textAlign: 'center', fontWeight: 'bold' }}>
                  {quantity}
                </div>
                <button 
                  style={{ padding: '0.75rem 1rem', backgroundColor: 'white', border: 'none', cursor: 'pointer' }}
                  onClick={() => setQuantity(Math.min(maxAvailableToAdd, quantity + 1))}
                  disabled={isOutOfStock || quantity >= maxAvailableToAdd}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '1.1rem' }}
                onClick={handleAddToCart}
                disabled={isOutOfStock || maxAvailableToAdd <= 0}
              >
                <ShoppingCart size={20} /> 
                {maxAvailableToAdd <= 0 && product.stock > 0 ? 'Max Reached' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
