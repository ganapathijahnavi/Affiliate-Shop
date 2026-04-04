import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import AdminDashboard from './components/AdminDashboard';
import { Product } from './types';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase fetch error:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-2xl font-bold uppercase tracking-widest animate-pulse text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <header className="mb-24 text-center max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black tracking-tight text-black mb-2"
        >
          Curated Products
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight text-red-500 mb-8"
        >
          Just For You
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium text-gray-500 leading-relaxed"
        >
          Discover handpicked items with exclusive deals. Click any product to explore more.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        <AnimatePresence mode="popLayout">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AnimatePresence>
      </div>

      {products.length === 0 && (
        <div className="text-center py-32">
          <p className="text-xl font-medium text-gray-400">
            {isSupabaseConfigured ? 'No products available yet.' : 'Supabase is not configured for this deployment.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-black font-sans selection:bg-red-100 selection:text-red-900">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        
        <footer className="py-12 border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xl font-black uppercase tracking-tighter">
              AFFILIATE<span className="text-red-500">.</span>SHOP
            </div>
            <p className="text-xs font-bold uppercase text-gray-400 tracking-widest">
              © {new Date().getFullYear()} Handpicked with care.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
