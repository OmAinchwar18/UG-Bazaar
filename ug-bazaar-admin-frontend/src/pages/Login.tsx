import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import type { RootState } from '../store';
import { apiClient } from '@ugbazaar/shared';
import { ShieldCheck, Lock, Smartphone, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated admin, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ mobile, password })
      });

      if (data.success && data.user) {
        if (data.user.role !== 'admin') {
          throw new Error('Access Denied: Admin privileges required.');
        }

        dispatch(setCredentials({ user: data.user, token: data.token }));
        navigate('/dashboard');
      } else {
        throw new Error('Invalid credentials.');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="bg-white border border-brand-border/60 shadow-2xl rounded-3xl p-8 max-w-md w-full space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <span className="bg-brand-green text-white p-3.5 rounded-2xl shadow-lg shadow-brand-green/20">
              <ShieldCheck className="w-8 h-8 text-brand-yellow fill-brand-yellow" />
            </span>
          </div>
          <div className="leading-tight">
            <span className="font-extrabold text-2xl text-brand-dark tracking-tight">UG</span>
            <span className="font-bold text-brand-green text-lg block -mt-1 tracking-wide">Bazaar Admin</span>
          </div>
          <p className="text-xs text-brand-muted font-bold pt-1">Enter your admin credentials to access console</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-2 text-xs font-bold text-red-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">Mobile Number</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. 9999999999"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-brand-light border border-brand-border/80 focus:border-brand-green focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all"
                required
              />
              <Smartphone className="w-5 h-5 text-brand-muted absolute left-4 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-muted uppercase">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-brand-light border border-brand-border/80 focus:border-brand-green focus:bg-white rounded-2xl outline-none font-medium text-sm transition-all"
                required
              />
              <Lock className="w-5 h-5 text-brand-muted absolute left-4 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 px-6 text-sm font-extrabold cursor-pointer mt-4"
          >
            {loading ? 'Authenticating...' : 'Sign In To Cockpit'}
          </button>
        </form>

        {/* Development mode indicator */}
        <div className="text-center pt-2">
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-xl text-[10px] font-bold border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-yellow fill-brand-yellow animate-pulse" />
            <span>Developer Mode Active (OTP Bypass `123456`)</span>
          </span>
        </div>

      </div>
    </div>
  );
}
