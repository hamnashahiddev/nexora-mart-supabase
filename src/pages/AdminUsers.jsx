import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import { Search, Filter, Shield, User } from 'lucide-react';
import Spinner from '../components/Spinner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header flex-between mb-6">
        <div className="admin-page-actions flex gap-4">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-outline flex-center gap-2">
            <Filter size={18} /> Filter Role
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
                <th>Customer</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-muted">No customers found.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex-center gap-4" style={{justifyContent: 'flex-start'}}>
                        <div className="admin-avatar-small" style={{
                          width: '36px', height: '36px', borderRadius: '50%', 
                          backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', 
                          justifyContent: 'center', fontWeight: 'bold', color: '#64748b'
                        }}>
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div style={{fontWeight: 500}}>{user.full_name || 'Anonymous User'}</div>
                          <div className="text-muted small">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-muted">{user.phone || 'N/A'}</div>
                    </td>
                    <td>
                      <span className={`status-badge flex-center gap-1 inline-flex ${user.role === 'admin' ? 'primary' : 'muted'}`}>
                        {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className="status-badge success">Active</span>
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

export default AdminUsers;
