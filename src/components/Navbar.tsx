
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const ADMIN_EMAIL = 'techworkspace05@gmail.com'; // Set your admin email here

export const Navbar: React.FC = () => {
  const [user, setUser] = React.useState<{ email: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!supabase) {
      setError('Supabase is not configured. Admin login is disabled.');
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email ?? '' });
      } else {
        setUser(null);
      }
    });
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ email: session.user.email ?? '' });
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    if (!supabase) {
      setError('Supabase is not configured. Admin login is disabled.');
      return;
    }
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    if (error) setError(error.message);
  };

  const handleLogout = async () => {
    if (!supabase) {
      setUser(null);
      navigate('/');
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const isAdmin = user && user.email === ADMIN_EMAIL;

  React.useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) {
      setError('Access denied: Only the admin email is allowed.');
      setTimeout(() => {
        setError(null);
        handleLogout();
      }, 2000);
    }
  }, [user]);

  return (
    <nav className="bg-white py-6 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 group">
          <span className="text-2xl font-black uppercase tracking-tighter">
            AFFILIATE<span className="text-red-500">.</span>SHOP
          </span>
        </Link>

        <div className="flex items-center gap-8">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="font-bold uppercase text-sm tracking-widest hover:text-red-500 transition-colors"
                >
                  ADMIN
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="font-bold uppercase text-sm tracking-widest hover:text-red-500 transition-colors"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="font-bold uppercase text-sm tracking-widest hover:text-red-500 transition-colors"
            >
              ADMIN
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="text-red-500 text-center mt-2 font-bold">{error}</div>
      )}
    </nav>
  );
};
