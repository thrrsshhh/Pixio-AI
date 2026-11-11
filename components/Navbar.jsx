import React from 'react';
import { Sparkles, Wand2, LayoutGrid, Layers, Zap, LogIn, LogOut, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, credits, openPricingModal, user, openAuthModal, onLogout }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#090A0F]/85 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab('home')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              PIXIO <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20">AI</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#12141C] p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" /> AI Studio
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" /> Collage Editor
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-pink-400" /> Dashboard
          </button>
        </nav>

        {/* User Balance & Account Auth Status */}
        <div className="flex items-center space-x-3">
          <button
            onClick={openPricingModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 transition-all text-amber-300 font-bold text-xs group cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform animate-pulse" />
            <span>{credits} Credits</span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-amber-500 text-black rounded font-mono">+BUY</span>
          </button>

          <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#12141C] border border-white/10 px-3 py-1.5 rounded-xl">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-white max-w-[100px] truncate">{user.name || user.email}</span>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md border border-indigo-400/30"
            >
              <LogIn className="w-4 h-4 text-cyan-300" /> 
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Toolbar */}
      <div className="flex md:hidden items-center justify-around bg-[#12141C] border-t border-white/5 py-2 px-1">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'home' ? 'text-cyan-400 bg-white/5' : 'text-gray-400'}`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('studio')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'studio' ? 'text-cyan-400 bg-white/5' : 'text-gray-400'}`}
        >
          Studio
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'editor' ? 'text-cyan-400 bg-white/5' : 'text-gray-400'}`}
        >
          Collage
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'dashboard' ? 'text-cyan-400 bg-white/5' : 'text-gray-400'}`}
        >
          Gallery
        </button>
        {!user && (
          <button
            onClick={openAuthModal}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}