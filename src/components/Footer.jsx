import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h2>Nexora Mart</h2>
            <p>Shop smarter. Live better. The premium destination for all your modern shopping needs.</p>
          </div>
          
          <div className="footer-links">
            <h3>Shop</h3>
            <Link to="/shop">All Products</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/shop?sort=newest">New Arrivals</Link>
            <Link to="/shop?sale=true">Offers</Link>
          </div>

          <div className="footer-links">
            <h3>Support</h3>
            <Link to="/contact">Contact Us</Link>
            <Link to="/about">About Us</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/returns">Returns</Link>
          </div>

          <div className="footer-links">
            <h3>Legal</h3>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Nexora Mart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
