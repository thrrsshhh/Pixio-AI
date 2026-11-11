import React, { useState } from 'react';
import { Layers, Image as ImageIcon, Trash2, Clock, Plus } from 'lucide-react';

export default function DashboardView({ gallery, setGallery, setActiveTab }) {
  const [filter, setFilter] = useState('all');

  const filteredGallery = filter === 'all' 
    ? gallery 
    : gallery.filter((item) => item.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Layers className="w-7 h-7 text-pink-400" /> Saved Cloud Gallery
        </h2>

        <div className="flex gap-1 bg-[#12141C] p-1 rounded-xl border border-white/5">
          {['all', 'bg_removed', 'collage'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === f ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {f === 'bg_removed' ? 'Cutouts' : f}
            </button>
          ))}
        </div>
      </div>

      {filteredGallery.length === 0 ? (
        <div className="text-center py-16 bg-[#12141C] rounded-2xl border border-white/5 space-y-4">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-gray-400 text-sm font-semibold">No assets found in gallery</p>
          <button
            onClick={() => setActiveTab && setActiveTab('studio')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create New AI Output
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredGallery.map((item) => (
            <div key={item.id} className="bg-[#12141C] rounded-2xl overflow-hidden border border-white/10 p-3 space-y-3">
              <div className="h-48 rounded-xl overflow-hidden bg-slate-950 relative">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase">
                  {item.type === 'collage' ? 'Collage' : 'AI Cutout'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-cyan-400" /> {item.createdAt}
                  </span>
                </div>
                <button
                  onClick={() => setGallery(gallery.filter((g) => g.id !== item.id))}
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}