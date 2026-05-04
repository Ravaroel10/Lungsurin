import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { User, UserRole } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 card-shadow border border-primary-100"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-10 scale-100">
            <Logo size={140} variant="large" />
          </div>
          <h2 className="text-3xl font-display font-bold text-primary-900 tracking-tighter uppercase">Selamat Datang Kembali</h2>
          <p className="text-primary-900/40 mt-2">Masuk untuk melanjutkan perjalanan keberlanjutan Anda.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary-900/60 uppercase tracking-widest pl-1">Alamat Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-900/30 group-focus-within:text-primary-600 transition-colors" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-12 pr-6 py-4 bg-primary-50/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary-900/60 uppercase tracking-widest pl-1">Kata Sandi</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-900/30 group-focus-within:text-primary-600 transition-colors" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-6 py-4 bg-primary-50/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm px-1">
            <label className="flex items-center gap-2 text-primary-900/70 cursor-pointer">
              <input type="checkbox" className="rounded-md border-primary-200 text-primary-500 focus:ring-primary-500" />
              <span>Ingat saya</span>
            </label>
            <Link to="/forgot-password" className="text-primary-500 font-bold hover:underline">Lupa kata sandi?</Link>
          </div>

          {error && <p className="text-rose-500 text-sm font-medium text-center">{error}</p>}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Sedang masuk...' : 'Masuk'}
            {!isLoading && <LogIn size={20} />}
          </button>
        </form>

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary-50"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-primary-900/30 font-bold tracking-widest">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={async () => {
            try {
              (window as any).addNotification('Redirecting to Google secure login...', 'info');
              await loginWithGoogle();
              navigate('/');
            } catch (err: any) {
              (window as any).addNotification(err.message || 'Google login failed.', 'error');
            }
          }}
          className="mt-6 w-full py-4 bg-white border-2 border-primary-100 text-primary-950 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary-50 transition-all active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>

        <div className="mt-8 pt-8 border-t border-primary-50 text-center">
          <p className="text-primary-900/40 text-sm">
            Don't have an account? <Link to="/signup" className="text-primary-500 font-bold hover:underline">Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    address: '',
    gender: 'Other',
    dateOfBirth: '',
    phoneNumber: '',
    role: 'USER' as UserRole,
  });
  const { register, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      (window as any).addNotification(err.message || 'Registration failed.', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-primary-50/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 card-shadow border border-primary-100"
      >
        <div className="text-center mb-12">
          <div className="flex justify-center mb-12 scale-100">
            <Logo size={130} variant="large" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary-900 mb-3 tracking-tighter uppercase">Gabung dalam Gerakan</h2>
          <p className="text-primary-900/40 text-sm sm:text-base px-4">Langkahlah ke masa depan fashion berkelanjutan.</p>
        </div>

        <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-primary-900/60 uppercase tracking-widest pl-1">Gabung Sebagai</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              {[
                { id: 'USER', label: 'Pembeli (Eco-User)' },
                { id: 'SELLER', label: 'Penjual (UMKM/Brand)' },
                { id: 'ADMIN', label: 'Administrator' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r.id as UserRole })}
                  className={cn(
                    "py-3 sm:py-4 modular-border font-black uppercase tracking-widest text-[10px] sm:text-[11px] transition-all text-center leading-tight px-2",
                    formData.role === r.id ? "bg-primary-500 text-white" : "bg-white text-primary-900/60 hover:bg-primary-50"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary-900/60 uppercase tracking-widest pl-1">Nama Pengguna</label>
            <input 
              name="username" required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-primary-50/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary-900/60 uppercase tracking-widest pl-1">Nama Lengkap</label>
            <input 
              name="fullName" required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-primary-50/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary-900/60 uppercase tracking-widest pl-1">Email</label>
            <input 
              name="email" type="email" required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-primary-50/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary-900/60 uppercase tracking-widest pl-1">Kata Sandi</label>
            <input 
              name="password" type="password" required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-primary-50/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary-900/60 uppercase tracking-widest pl-1">Jenis Kelamin</label>
            <select 
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-primary-50/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary-500 transition-all font-medium"
            >
              <option value="Male">Laki-laki</option>
              <option value="Female">Perempuan</option>
              <option value="Other">Lainnya</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary-900/60 uppercase tracking-widest pl-1">Tanggal Lahir</label>
            <input 
              name="dateOfBirth" type="date" required
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-primary-50/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-primary-900/60 uppercase tracking-widest pl-1">Nomor Telepon</label>
            <input 
              name="phoneNumber" required
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-primary-50/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-primary-900/60 uppercase tracking-widest pl-1">Alamat</label>
            <input 
              name="address" required
              value={formData.address}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-primary-50/50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary-500 transition-all font-medium"
            />
          </div>

          <div className="md:col-span-2 pt-6">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-primary-500 text-white rounded-[2rem] font-bold text-lg hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Membuat Akun...' : 'Mulai Sekarang'}
            </button>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-50"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-primary-900/30 font-bold tracking-widest">Atau gabung dengan</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={async () => {
                try {
                  (window as any).addNotification('Menghubungkan ke Google...', 'info');
                  await loginWithGoogle();
                  navigate('/');
                } catch (err: any) {
                  (window as any).addNotification(err.message || 'Gagal menghubungkan akun Google.', 'error');
                }
              }}
              className="mt-6 w-full py-5 bg-white border-2 border-primary-100 text-primary-950 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary-50 transition-all active:scale-[0.98]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
              Daftar dengan Google
            </button>
          </div>
        </form>

        <div className="mt-10 pt-8 border-t border-primary-50 text-center">
          <p className="text-primary-900/40">
            Sudah punya akun? <Link to="/login" className="text-primary-500 font-bold hover:underline">Masuk</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
