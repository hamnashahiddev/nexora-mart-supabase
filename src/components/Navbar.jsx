import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePersistentNotification } from '../context/PersistentNotificationContext';
import { ShoppingCart, User, Menu, X, Search, LogOut, Bell, Check, CheckCheck } from 'lucide-react';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const { cartCount } = useCart();
  const { dbNotifications, unreadCount, markAsRead, markAllAsRead } = usePersistentNotification();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          Nexora Mart
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links hidden-mobile">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/shop" className="nav-link">Shop</Link>
          <Link to="/categories" className="nav-link">Categories</Link>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="navbar-search hidden-mobile">
          <input type="text" placeholder="Search products..." className="search-input" />
          <Search className="search-icon" size={18} />
        </div>

        {/* Icons (Desktop) */}
        <div className="navbar-actions hidden-mobile">
          {user && (
            <div className="nav-icon-wrapper" style={{position: 'relative'}}>
              <button 
                className="nav-icon-btn" 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'inherit'}}
              >
                <Bell size={24} />
                {unreadCount > 0 && <span className="cart-badge" style={{backgroundColor: 'var(--accent-blue)'}}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              
              {isNotifOpen && (
                <div className="dropdown notif-dropdown" style={{display: 'block', width: '350px', right: '-100px', maxHeight: '400px', overflowY: 'auto'}}>
                  <div className="dropdown-header flex-between" style={{flexDirection: 'row'}}>
                    <strong>Notifications</strong>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="auth-link small flex-center gap-1" style={{background: 'none', border: 'none', cursor: 'pointer'}}>
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {dbNotifications.length === 0 ? (
                      <div className="p-4 text-center text-muted small">No notifications yet.</div>
                    ) : (
                      dbNotifications.map(notif => (
                        <div key={notif.id} className={`dropdown-item ${!notif.is_read ? 'bg-light' : ''}`} style={{flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', borderBottom: '1px solid var(--border-color)', position: 'relative'}}>
                          <div className="flex-between w-full mb-1">
                            <span style={{fontWeight: !notif.is_read ? 600 : 500, color: 'var(--primary-navy)'}}>{notif.title}</span>
                            {!notif.is_read && (
                              <button onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }} className="btn-icon text-accent" title="Mark as read" style={{position: 'absolute', right: '0.5rem', top: '0.5rem'}}>
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                          <div className="text-muted small mb-2" style={{lineHeight: 1.4}}>{notif.message}</div>
                          <div className="text-muted" style={{fontSize: '0.75rem'}}>{new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Link to="/cart" className="nav-icon-wrapper">
            <ShoppingCart size={24} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          
          {user ? (
            <div className="nav-user-menu">
              <Link to="/profile" className="nav-icon-wrapper">
                <User size={24} />
              </Link>
              <div className="dropdown">
                <div className="dropdown-header">
                  <strong>{profile?.full_name || 'User'}</strong>
                  <span className="dropdown-email">{user.email}</span>
                </div>
                <Link to="/profile" className="dropdown-item">My Profile</Link>
                <Link to="/orders" className="dropdown-item">My Orders</Link>
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="dropdown-item admin-link">Admin Dashboard</Link>
                )}
                <button onClick={handleLogout} className="dropdown-item text-danger">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline small">Log In</Link>
              <Link to="/signup" className="btn btn-primary small">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-btn hidden-desktop"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu hidden-desktop">
          <div className="mobile-search">
            <input type="text" placeholder="Search products..." className="search-input" />
          </div>
          <Link to="/" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/shop" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
          <Link to="/categories" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Categories</Link>
          <Link to="/cart" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
            Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          
          {user ? (
            <>
              <Link to="/profile" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
              <Link to="/orders" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
              {profile?.role === 'admin' && (
                <Link to="/admin" className="mobile-link admin-link" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
              )}
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="mobile-link text-danger text-left">
                Logout
              </button>
            </>
          ) : (
            <div className="mobile-auth-buttons">
              <Link to="/login" className="btn btn-outline btn-block" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-block" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
