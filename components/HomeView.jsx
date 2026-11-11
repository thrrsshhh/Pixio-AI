import React, { useState, useRef } from 'react';
import { Wand2, LayoutGrid, Scissors, Maximize2, Sun, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function HomeView({ setActiveTab }) {
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);

  const handleMove = (clientX, rect) => {
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    setSliderPos((x / rect.width) * 100);
  };

  const handleTouchMove = (e, rect) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX, rect);
    }
  };

  return (
    <div className="space-y-16 py-6">
      <div className="text-center max-w-4xl mx-auto pt-8 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#12141C] border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> Next-Gen Neural Photo Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Instant <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500 bg-clip-text text-transparent">AI Background Extraction</span> & Pro Collage Studio
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Transform raw portrait uploads into clean transparent cutouts, upscale pixel detail up to 4K, and compose multi-image aesthetic grid collages.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab('studio')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-base shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
          >
            <Wand2 className="w-5 h-5 text-cyan-300" /> Launch AI Studio <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className="px-8 py-4 rounded-xl bg-[#12141C] hover:bg-white/10 text-white font-bold text-base border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LayoutGrid className="w-5 h-5 text-indigo-400" /> Build Collage
          </button>
        </div>

        <div className="flex items-center justify-center gap-6 pt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> High Precision AI Cutout</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Fast Local GPU Rendering</span>
        </div>
      </div>

      {/* Interactive Split-Screen Slider Demo */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-gray-400">Interactive Processing Preview (Drag Slider)</span>
        </div>

        <div className="bg-[#12141C]/80 p-3 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
          <div 
            className="relative w-full h-[380px] sm:h-[460px] rounded-xl overflow-hidden cursor-ew-resize select-none bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950"
            onMouseDown={() => (isDragging.current = true)}
            onMouseUp={() => (isDragging.current = false)}
            onMouseLeave={() => (isDragging.current = false)}
            onTouchStart={() => (isDragging.current = true)}
            onTouchEnd={() => (isDragging.current = false)}
            onTouchMove={(e) => {
              if (isDragging.current) {
                handleTouchMove(e, e.currentTarget.getBoundingClientRect());
              }
            }}
            onMouseMove={(e) => {
              if (isDragging.current) {
                handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
              }
            }}
          >
            {/* Original Image Background */}
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80" 
              alt="Original" 
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* AI Processed Overlay */}
            <div 
              className="absolute inset-0 overflow-hidden border-r-2 border-cyan-400 shadow-[2px_0_15px_rgba(6,182,212,0.6)]"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="w-full h-full bg-[#090A0F]/90 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80" 
                  alt="Processed Cutout" 
                  className="w-full h-full object-cover filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] scale-105"
                />
              </div>
            </div>

            {/* Slider Handle Knob */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize transform -translate-x-1/2"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.8)] font-bold">
                ↔
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Showcase Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-8">
        <div className="bg-[#12141C] p-6 rounded-2xl border border-white/5 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Scissors className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Hair-Level Cutout Precision</h3>
          <p className="text-xs text-gray-400 leading-relaxed">AI neural edge detection isolates fine hair strands, transparent fabrics, and complex background layers cleanly.</p>
        </div>

        <div className="bg-[#12141C] p-6 rounded-2xl border border-white/5 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Maximize2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">4K Super Resolution</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Upscale low-resolution photos up to 400% with restored textures and noise removal algorithms.</p>
        </div>

        <div className="bg-[#12141C] p-6 rounded-2xl border border-white/5 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Collage Studio Engine</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Mix cutouts into grid layouts, attach typography stickers, and export social-ready high-res graphics.</p>
        </div>
      </div>
    </div>
  );
}