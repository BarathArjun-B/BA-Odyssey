import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CosmicBackground, MoonElement } from '../../components/cosmic';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative isolate overflow-hidden bg-[#050505]">
      <CosmicBackground />
      <MoonElement />
      
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border mx-4" style={{
        background: 'rgba(10, 10, 10, 0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.5)'
      }}>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded flex items-center justify-center font-catalogue font-bold text-2xl mb-4" style={{ 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
            color: 'var(--text-primary)' 
          }}>
            BA
          </div>
          <h1 className="text-display-md text-primary font-catalogue text-center">
            {isLogin ? 'Welcome Back' : 'Begin Your Odyssey'}
          </h1>
          <p className="text-muted mt-2 text-center text-sm">
            {isLogin 
              ? 'Enter your credentials to access your terminal.' 
              : 'Create an account to start tracking your founder journey.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <div className="flex gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent-violet transition-colors placeholder:text-white/30"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent-violet transition-colors placeholder:text-white/30"
                />
              </div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent-violet transition-colors placeholder:text-white/30"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent-violet transition-colors placeholder:text-white/30"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent-violet transition-colors placeholder:text-white/30"
          />

          <button
            type="submit"
            className="w-full py-3 mt-4 rounded-lg font-medium text-white transition-transform active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
          >
            {isLogin ? 'Initialize Session' : 'Create Profile'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-muted hover:text-primary transition-colors text-sm"
          >
            {isLogin 
              ? "Don't have an account? Register" 
              : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
