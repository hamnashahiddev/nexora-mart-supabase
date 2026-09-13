import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, RefreshCw, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch top 4 featured products (we'll just use the first 4 for now)
        const { data: products } = await supabase
          .from('products')
          .select('*, categories(name)')
          .limit(4);
          
        setFeaturedProducts(products || []);

        // Fetch categories
        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .limit(6);
          
        setCategories(cats || []);

      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (isLoading) {
    return <div style={{height: '100vh'}}><Spinner /></div>;
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Shop smarter.<br/>Live better.</h1>
          <p>Discover products you'll love, manage your orders effortlessly, and enjoy a simple shopping experience built for you.</p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
            <Link to="/categories" className="btn btn-outline">Explore Categories</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section page-container">
        <div className="features-grid">
          <div className="feature-card">
            <Shield className="feature-icon" size={32} />
            <h3>Secure Shopping</h3>
            <p>Your data is protected with enterprise-grade security.</p>
          </div>
          <div className="feature-card">
            <Truck className="feature-icon" size={32} />
            <h3>Fast Delivery</h3>
            <p>Get your products delivered quickly and reliably.</p>
          </div>
          <div className="feature-card">
            <RefreshCw className="feature-icon" size={32} />
            <h3>Easy Returns</h3>
            <p>30-day hassle-free return policy on all items.</p>
          </div>
          <div className="feature-card">
            <Star className="feature-icon" size={32} />
            <h3>Premium Quality</h3>
            <p>Only the best products from trusted brands.</p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="categories-section bg-light">
        <div className="page-container">
          <div className="section-header flex-between">
            <h2>Featured Categories</h2>
            <Link to="/categories" className="auth-link flex-center gap-2">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="category-grid">
            {categories.map(category => (
              <Link to={`/shop?category=${category.slug}`} key={category.id} className="category-card">
                <img src={category.image_url} alt={category.name} />
                <div className="category-overlay">
                  <h3>{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products page-container">
        <div className="section-header flex-between">
          <h2>Trending Products</h2>
          <Link to="/shop" className="auth-link flex-center gap-2">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
