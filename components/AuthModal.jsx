'use client';

import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter an email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: name.trim() || cleanEmail.split('@')[0],
        }),
      });

      const text = await res.text();
      if (!text) {
        throw new Error(`Server returned an empty response (HTTP ${res.status}). Check app/api/auth/route.ts.`);
      }

      const data = JSON.parse(text);
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Login failed (HTTP ${res.status})`);
      }

      await onAuthSuccess({
        name: data.user.name || cleanEmail.split('@')[0],
        email: data.user.email,
      });

      setName('');
      setEmail('');
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#121218] border border-gray-800 p-6 text-white space-y-6 relative shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/10"
        >
          ✕
        </button>

        <div>
          <h2 className="text-xl font-bold">Sign In or Create Account</h2>
          <p className="text-xs text-gray-400 mt-1">
            Each email gets its own 10 free credits, gallery, and collage history.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Thrisha"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-gray-800 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user1@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-gray-800 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}