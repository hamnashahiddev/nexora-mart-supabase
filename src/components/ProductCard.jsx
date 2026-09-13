import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addNotification } = useNotification();

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link
    e.stopPropagation();
    
    if (product.stock < 1) {
      addNotification('This product is out of stock', 'error');
      return;
    }

    const result = await addToCart(product.id, 1);
    if (result.error) {
      addNotification(result.error.message || 'Failed to add to cart', 'error');
    } else {
      addNotification(`${product.name} added to cart`, 'success');
    }
  };

  const discount = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100) 
    : 0;

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-image-wrapper">
        <img 
          src={product.image_url || 'https://via.placeholder.com/300?text=No+Image'} 
          alt={product.name} 
          className="product-card-image"
          loading="lazy"
        />
        {discount > 0 && <span className="product-badge sale">-{discount}%</span>}
        {product.stock < 1 && <span className="product-badge out-of-stock">Out of Stock</span>}
      </Link>
      
      <div className="product-card-content">
        <div className="product-category">{product.categories?.name || 'Uncategorized'}</div>
        <Link to={`/product/${product.id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        
        <div className="product-price-row">
          {product.sale_price ? (
            <>
              <span className="price-current">${product.sale_price.toFixed(2)}</span>
              <span className="price-original">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="price-current">${product.price.toFixed(2)}</span>
          )}
        </div>
        
        <div className="product-card-actions">
          <button 
            className="btn btn-primary btn-block flex-center gap-2"
            onClick={handleAddToCart}
            disabled={product.stock < 1}
          >
            <ShoppingCart size={18} />
            {product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
