import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePersistentNotification } from '../context/PersistentNotificationContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tags, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Check,
  CheckCheck
} from 'lucide-react';

export const AdminLayout = () => {
  const { profile, signOut } = useAuth();
  const { dbNotifications, unreadCount, markAsRead, markAllAsRead } = usePersistentNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo">Nexora Admin</Link>
          <button 
            className="admin-sidebar-toggle hidden-desktop"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (window.innerWidth <= 768) setIsSidebarOpen(false);
                }}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/admin/settings" className="admin-nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <button onClick={handleLogout} className="admin-nav-item text-danger">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button 
              className="admin-menu-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <h2 className="admin-page-title">
              {navItems.find(item => item.path === location.pathname)?.name || 'Admin'}
            </h2>
          </div>
          
          <div className="admin-header-right">
            <div className="nav-icon-wrapper" style={{position: 'relative'}}>
              <button 
                className="admin-icon-btn"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="admin-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              
              {isNotifOpen && (
                <div className="dropdown notif-dropdown" style={{display: 'block', width: '350px', right: '0', maxHeight: '400px', overflowY: 'auto', position: 'absolute', top: '100%', backgroundColor: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)'}}>
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
                          <div className="text-muted small mb-2" style={{lineHeight: 1.4, whiteSpace: 'normal'}}>{notif.message}</div>
                          <div className="text-muted" style={{fontSize: '0.75rem'}}>{new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="admin-user-profile">
              <div className="admin-avatar">
                {profile?.full_name?.charAt(0) || 'A'}
              </div>
              <span className="hidden-mobile">{profile?.full_name || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
