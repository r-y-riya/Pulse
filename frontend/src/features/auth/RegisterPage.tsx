import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Loader2, Activity } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return toast.error("Please fill in all fields");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Welcome to Pulse!");
      navigate('/settings'); // Redirect to profile setup/settings on sign-up
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md pulse-card relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-xl mb-3 shadow-lg shadow-primary/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-heading">Create your account</h2>
          <p className="text-xs text-text-muted mt-1 font-medium">Train Smarter. Live Better.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-text-heading placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-text-heading placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-text-heading placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm hover:shadow-lg hover:shadow-primary/10 transition-all flex items-center justify-center gap-2 border-0"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin text-white" size={16} />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <p className="text-xs text-text-muted text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-bold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;
