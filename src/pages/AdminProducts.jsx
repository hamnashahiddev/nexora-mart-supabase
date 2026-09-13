import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import Spinner from '../components/Spinner';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      addNotification('Product deleted successfully', 'success');
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header flex-between mb-6">
        <div className="admin-page-actions flex gap-4">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-outline flex-center gap-2">
            <Filter size={18} /> Filter
          </button>
        </div>
        <button className="btn btn-primary flex-center gap-2">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="admin-table-container">
        {isLoading ? (
          <Spinner className="p-12" />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-muted">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="flex-center gap-4" style={{justifyContent: 'flex-start'}}>
                        <img 
                          src={product.image_url || 'https://via.placeholder.com/40'} 
                          alt={product.name}
                          className="admin-table-img"
                          style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}}
                        />
                        <div>
                          <div style={{fontWeight: 500}}>{product.name}</div>
                          <div className="text-muted small">SKU: {product.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category?.name || 'Uncategorized'}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${product.is_active ? 'success' : 'muted'}`}>
                        {product.is_active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-icon text-accent"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(product.id)} className="btn-icon text-danger"><Trash2 size={18} /></button>
                      </div>
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

export default AdminProducts;
