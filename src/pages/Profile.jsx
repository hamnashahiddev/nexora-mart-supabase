import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';
import { User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const { addNotification } = useNotification();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local context
      await updateProfile();
      
      addNotification('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container" style={{maxWidth: '800px'}}>
      <h1 className="mb-8">My Profile</h1>
      
      <div className="profile-card bg-white p-8 rounded-lg shadow-sm border">
        <div className="flex-between mb-8 pb-6 border-b">
          <div className="flex items-center gap-6">
            <div className="profile-avatar flex-center" style={{
              width: 80, height: 80, borderRadius: '50%', 
              backgroundColor: 'var(--accent-blue)', color: 'white', fontSize: '2rem', fontWeight: 'bold'
            }}>
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="mb-1">{profile?.full_name || 'Customer'}</h2>
              <div className="text-muted flex items-center gap-2">
                <Mail size={16} /> {user?.email}
              </div>
            </div>
          </div>
          {!isEditing && (
            <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="grid-2 gap-6 mb-6">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" size={18} />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? <Loader2 className="spinner-icon" size={18} /> : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details grid-2 gap-6">
            <div>
              <label className="text-muted small uppercase tracking-wide block mb-1">Role</label>
              <div className="font-medium capitalize">{profile?.role || 'Customer'}</div>
            </div>
            <div>
              <label className="text-muted small uppercase tracking-wide block mb-1">Phone</label>
              <div className="font-medium">{profile?.phone || 'Not provided'}</div>
            </div>
            <div>
              <label className="text-muted small uppercase tracking-wide block mb-1">Joined Date</label>
              <div className="font-medium">{new Date(profile?.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
