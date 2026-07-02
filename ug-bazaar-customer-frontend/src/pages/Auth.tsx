import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { apiClient } from '../api/apiClient';
import { Sparkles, Phone, Lock, User, MapPin, KeyRound, ArrowLeft } from 'lucide-react';

type AuthScreen = 'login' | 'register' | 'otp_verify' | 'forgot_password' | 'reset_password';

export default function Auth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [screen, setScreen] = useState<AuthScreen>('login');
  
  // Fields for Login/Register
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  
  // Fields for OTP/Reset
  const [otpCode, setOtpCode] = useState('');
  const [otpMobile, setOtpMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize Google Sign In
  useEffect(() => {
    let timer: any;

    const initGoogle = () => {
      if ((window as any).google?.accounts?.id) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            setLoading(true);
            setErrorMsg(null);
            setSuccessMsg(null);
            try {
              const res = await apiClient('/auth/google-login', {
                method: 'POST',
                body: JSON.stringify({ idToken: response.credential })
              });
              if (res.success && res.token) {
                dispatch(setCredentials({ user: res.user, token: res.token }));
                navigate('/');
              }
            } catch (err: any) {
              setErrorMsg(err.message || 'Google Login failed');
            } finally {
              setLoading(false);
            }
          }
        });
        
        const btnElem = document.getElementById("google-signin-btn");
        if (btnElem) {
          (window as any).google.accounts.id.renderButton(
            btnElem,
            { theme: "outline", size: "large", width: 380 }
          );
        }
      }
    };

    if (screen === 'login') {
      timer = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          initGoogle();
          clearInterval(timer);
        }
      }, 500);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [screen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (screen === 'login') {
        if (!mobile || !password) return;
        const res = await apiClient('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ mobile, password })
        });
        if (res.success && res.token) {
          dispatch(setCredentials({ user: res.user, token: res.token }));
          navigate('/');
        }
      } else if (screen === 'register') {
        if (!name || !mobile || !password) return;
        const res = await apiClient('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, mobile, password, village })
        });
        if (res.success) {
          setOtpMobile(mobile);
          setScreen('otp_verify');
          await apiClient('/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ mobile })
          }).catch(() => {});
        }
      } else if (screen === 'forgot_password') {
        if (!otpMobile) return;
        const res = await apiClient('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ mobile: otpMobile })
        });
        if (res.success) {
          setSuccessMsg(res.message || 'Reset OTP sent successfully!');
          setScreen('reset_password');
        }
      } else if (screen === 'reset_password') {
        if (!otpMobile || !otpCode || !newPassword) return;
        const res = await apiClient('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ mobile: otpMobile, otp: otpCode, newPassword })
        });
        if (res.success) {
          setSuccessMsg('Password reset successful! Kripya login karein.');
          setScreen('login');
          setOtpCode('');
          setNewPassword('');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ mobile: otpMobile, otp: otpCode })
      });
      if (res.success && res.token) {
        dispatch(setCredentials({ user: res.user, token: res.token }));
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white border border-brand-border/60 rounded-3xl p-8 shadow-xl animate-slide-up">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green px-4 py-2 rounded-2xl">
            <Sparkles className="w-5 h-5 text-brand-yellow fill-brand-yellow" />
            <span className="font-extrabold text-sm tracking-wide">Namaste! Swagat Hai</span>
          </div>
          <h2 className="font-extrabold text-2xl text-brand-dark mt-4">
            {screen === 'login' && 'UG Bazaar Session'}
            {screen === 'register' && 'Naya Account Banayein'}
            {screen === 'otp_verify' && 'OTP Verification'}
            {screen === 'forgot_password' && 'Password Bhool Gaye?'}
            {screen === 'reset_password' && 'Naya Password Set Karein'}
          </h2>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-bold text-center mb-6 animate-pulse">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-xs font-bold text-center mb-6">
            {successMsg}
          </div>
        )}

        {(screen === 'login' || screen === 'register') && (
          <div className="flex border-b border-brand-border mb-6">
            <button
              type="button"
              onClick={() => { setScreen('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 pb-3 text-sm font-extrabold border-b-2 transition-all ${
                screen === 'login' ? 'border-brand-green text-brand-green' : 'border-transparent text-brand-muted'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setScreen('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 pb-3 text-sm font-extrabold border-b-2 transition-all ${
                screen === 'register' ? 'border-brand-green text-brand-green' : 'border-transparent text-brand-muted'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {screen === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">Mobile / Username</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Registered Mobile or Username"
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium"
                  required
                />
                <Phone className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => { setScreen('forgot_password'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-xs text-brand-green hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Secret Password"
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium"
                  required
                />
                <Lock className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-4 text-sm font-extrabold"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-brand-border"></div>
              <span className="flex-shrink mx-4 text-brand-muted text-xs font-bold uppercase">Or continue with</span>
              <div className="flex-grow border-t border-brand-border"></div>
            </div>
            
            <div id="google-signin-btn" className="flex justify-center w-full min-h-[40px]"></div>
          </form>
        )}

        {screen === 'register' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">Full Name</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Uday ji"
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium"
                  required
                />
                <User className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">Mobile / Username</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Registered Mobile or Username"
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium"
                  required
                />
                <Phone className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">Password</label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Secret Password"
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium"
                  required
                />
                <Lock className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">Village Name</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Talodhi, Gondpipri"
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium"
                />
                <MapPin className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-4 text-sm font-extrabold"
            >
              {loading ? 'Processing...' : 'Register Account'}
            </button>
          </form>
        )}

        {screen === 'otp_verify' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-brand-muted">
                Enter the 6-digit OTP code sent to:
              </p>
              <p className="font-extrabold text-brand-dark mt-1">+91 {otpMobile}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase block text-center">Verify Code</label>
              <div className="relative flex items-center justify-center">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="------"
                  className="w-40 text-center tracking-[0.5em] bg-brand-light border rounded-xl py-3 text-lg outline-none font-black text-brand-dark pl-3"
                  required
                />
                <KeyRound className="w-4 h-4 text-brand-muted absolute left-8" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-extrabold"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Log In'}
            </button>
          </form>
        )}

        {screen === 'forgot_password' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-xs text-brand-muted font-medium">
                Apna registered mobile number enter karein. Hum aapko ek password reset OTP bhejenge.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">Mobile Number</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={otpMobile}
                  onChange={(e) => setOtpMobile(e.target.value)}
                  placeholder="Enter 10-Digit Mobile"
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium"
                  required
                />
                <Phone className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 text-sm font-extrabold"
            >
              {loading ? 'Sending...' : 'Send Reset OTP'}
            </button>

            <button
              type="button"
              onClick={() => { setScreen('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className="flex items-center gap-2 justify-center w-full py-2.5 text-xs font-bold text-brand-muted hover:text-brand-dark transition-all mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </form>
        )}

        {screen === 'reset_password' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-xs text-brand-muted font-medium">
                Reset OTP and Naya Password enter karein.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">Reset OTP Code</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="6-Digit OTP"
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium"
                  required
                />
                <KeyRound className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">New Password</label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter New Password (min 6 characters)"
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium"
                  required
                />
                <Lock className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 text-sm font-extrabold"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => { setScreen('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className="flex items-center gap-2 justify-center w-full py-2.5 text-xs font-bold text-brand-muted hover:text-brand-dark transition-all mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
