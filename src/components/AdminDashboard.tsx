
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Trash2, Edit2, Save, Image as ImageIcon, Link as LinkIcon, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


type Product = {
  id: string;
  title: string;
  imageUrl: string;
  affiliateLink: string;
  created_at?: string;
};

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', affiliateLink: '' });
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Removed password reset state
  const [user, setUser] = useState<any>(null);

  // Set your admin email here
  const ADMIN_EMAIL = "techworkspace05@gmail.com";


  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (isEditing) {
      const { error } = await supabase
        .from('products')
        .update({
          title: formData.title,
          imageUrl: formData.imageUrl,
          affiliateLink: formData.affiliateLink
        })
        .eq('id', isEditing);
      if (!error) {
        await fetchProducts();
        setIsEditing(null);
        setFormData({ title: '', imageUrl: '', affiliateLink: '' });
        setSuccess('Product updated successfully.');
      } else {
        setError(error.message || 'Unknown error while updating product');
      }
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            title: formData.title,
            imageUrl: formData.imageUrl,
            affiliateLink: formData.affiliateLink
          }
        ])
        .select();
      if (!error && data && data.length > 0) {
        setProducts([data[0] as Product, ...products]);
        setFormData({ title: '', imageUrl: '', affiliateLink: '' });
        setSuccess('Product added successfully.');
      } else if (error) {
        setError(error.message || 'Unknown error while adding product');
      }
    }
  };


  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError("");
    setSuccess("");
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter((p: Product) => p.id !== id));
      setSuccess('Product deleted successfully.');
    } else {
      setError(error.message || 'Unknown error while deleting product');
    }
  };


  const handleEdit = (product: Product) => {
    setIsEditing(product.id);
    setFormData({
      title: product.title,
      imageUrl: product.imageUrl,
      affiliateLink: product.affiliateLink || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        setUser(session.user);
        if (session.user.email === ADMIN_EMAIL) {
          setShowLogin(false);
        } else {
          setShowLogin(true);
        }
      } else {
        setUser(null);
        setShowLogin(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        setUser(session.user);
        if (session.user.email === ADMIN_EMAIL) {
          setShowLogin(false);
        }
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);


  const handleLogin = async () => {
    setError("");
    setSuccess("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
  };


  // Removed password reset handler


  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogin(true);
    setUser(null);
    setSuccess("");
    setError("");
  };


  if (showLogin) {
    return (
      <div style={{ maxWidth: 350, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8, background: "#fff" }}>
        <h2 style={{ textAlign: "center" }}>Admin Login</h2>
        <button
          onClick={handleLogin}
          style={{ width: "100%", padding: 10, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, fontWeight: "bold", marginTop: 16 }}
        >
          Sign in with Google
        </button>
        {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
        {success && <div style={{ color: "green", marginTop: 12 }}>{success}</div>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <button onClick={handleLogout} style={{ float: 'right', marginBottom: 16, background: '#eee', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>Logout</button>
      <motion.div layout className="bg-white border border-gray-100 p-8 rounded-3xl mb-10 shadow-md">
        <h2 className="text-2xl font-black uppercase mb-10 tracking-tight">{isEditing ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div style={{ color: 'red', fontWeight: 'bold', marginBottom: 12 }}>{error}</div>
          )}
          {success && (
            <div style={{ color: 'green', fontWeight: 'bold', marginBottom: 12 }}>{success}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block font-bold mb-2 flex items-center gap-2"><Type size={16} /> Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-2 flex items-center gap-2"><ImageIcon size={16} /> Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-2 flex items-center gap-2"><LinkIcon size={16} /> Affiliate Link</label>
              <input
                type="url"
                value={formData.affiliateLink}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, affiliateLink: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-500 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isEditing ? <Save size={18} /> : <Plus size={18} />}
              {isEditing ? 'Update Product' : 'Add Product'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(null);
                  setFormData({ title: '', imageUrl: '', affiliateLink: '' });
                  setError("");
                  setSuccess("");
                }}
                className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      {/* List Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black uppercase mb-10 tracking-tight">Existing Products</h2>
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          <AnimatePresence mode="popLayout">
            {products.map((product: Product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-gray-100 p-5 rounded-3xl flex items-center gap-6 hover:shadow-lg transition-all group"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{product.title}</h3>
                  <p className="text-xs text-gray-400 font-medium truncate mt-1">{product.affiliateLink}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-3 bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all rounded-xl"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-3 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white transition-all rounded-xl"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">No products yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;