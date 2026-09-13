import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    setActionError('');
    const { error } = await addToCart(product, 1);
    if (error) {
      setActionError(error.message);
      setTimeout(() => setActionError(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container flex-center" style={{ minHeight: '60vh' }}>
        <Loader2 className="spinner-icon text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      
      {actionError && (
        <div className="alert alert-danger mb-4 flex-center gap-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '1rem', borderRadius: '4px' }}>
          <AlertCircle size={20} />
          <span>{actionError}</span>
        </div>
      )}

      <div className="flex-between align-center mb-8">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Shop Now</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {products.map(product => (
          <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ height: '250px', backgroundColor: '#f3f4f6', position: 'relative' }}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="flex-center" style={{ width: '100%', height: '100%', color: '#9ca3af' }}>No Image</div>
              )}
              {product.stock === 0 && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'var(--danger-color)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  Out of Stock
                </div>
              )}
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="flex-between align-center mb-2">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{product.name}</h3>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>${Number(product.price).toFixed(2)}</span>
              </div>
              
              <p style={{ color: 'var(--text-main)', opacity: 0.8, marginBottom: '1.5rem', flex: 1 }}>
                {product.description?.substring(0, 100)}{product.description?.length > 100 ? '...' : ''}
              </p>
              
              <p style={{ fontSize: '0.875rem', color: product.stock > 0 ? 'var(--success-color)' : 'var(--danger-color)', marginBottom: '1rem' }}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Currently unavailable'}
              </p>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <Link to={`/product/${product.id}`} className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {products.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No products found</h3>
            <p style={{ color: 'var(--text-main)' }}>Check back later for new inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
