'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isSignup ? 'signup' : 'login',
          email,
          password,
          name: isSignup ? name : undefined,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed');
        return;
      }

      localStorage.setItem('pixio_user', JSON.stringify(data.user));
      router.push('/');
    } catch {
      setLoading(false);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-white flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md bg-[#121218] border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {isSignup ? 'Create Pixio AI Account' : 'Welcome Back to Pixio AI'}
          </h1>
          <p className="text-sm text-gray-400">
            {isSignup
              ? 'Sign up to get 10 free credits and your own private gallery.'
              : 'Sign in to access your saved edits, cutouts, and collages.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#090A0F] border border-gray-800 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#090A0F] border border-gray-800 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#090A0F] border border-gray-800 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-sm font-semibold text-white shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400 pt-2 border-t border-gray-800">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}