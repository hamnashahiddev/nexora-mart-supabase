import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Spinner from '../components/Spinner';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) return;
    
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      addNotification('Category deleted successfully', 'success');
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header flex-between mb-6">
        <div className="admin-page-actions flex gap-4">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-primary flex-center gap-2">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="admin-table-container">
        {isLoading ? (
          <Spinner className="p-12" />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-muted">No categories found.</td>
                </tr>
              ) : (
                filteredCategories.map(category => (
                  <tr key={category.id}>
                    <td>
                      <div className="flex-center gap-4" style={{justifyContent: 'flex-start'}}>
                        <img 
                          src={category.image_url || 'https://via.placeholder.com/40'} 
                          alt={category.name}
                          className="admin-table-img"
                          style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}}
                        />
                        <div style={{fontWeight: 500}}>{category.name}</div>
                      </div>
                    </td>
                    <td className="text-muted">{category.slug}</td>
                    <td className="text-muted truncate" style={{maxWidth: '200px'}}>{category.description || 'N/A'}</td>
                    <td>{new Date(category.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-icon text-accent"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(category.id)} className="btn-icon text-danger"><Trash2 size={18} /></button>
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

export default AdminCategories;
