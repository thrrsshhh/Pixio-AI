'use client';

import React, { useEffect } from 'react';

export default function DashboardView({
  user,
  gallery = [],
  setGallery,
  setActiveTab,
}) {
  useEffect(() => {
    const email = user?.email || 'guest@pixio.ai';
    fetch(`/api/remove-bg?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.history)) {
          setGallery(
            data.history.map((item) => ({
              id: item.id,
              url: item.processedUrl || item.originalUrl,
              type: item.type,
              createdAt: new Date(item.createdAt).toLocaleDateString(),
            }))
          );
        }
      })
      .catch((err) => console.error('Dashboard fetch error:', err));
  }, [user, setGallery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-white space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Saved History & Gallery</h1>
          <p className="text-sm text-gray-400 mt-1">
            All your AI cutouts, upscales, and exported collages saved for{' '}
            <span className="text-purple-400 font-medium">
              {user?.email || 'guest@pixio.ai'}
            </span>
          </p>
        </div>

        <button
          onClick={() => setActiveTab('studio')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-sm font-semibold text-white shadow-lg transition"
        >
          + New AI Edit
        </button>
      </div>

      {gallery.length === 0 ? (
        <div className="bg-[#121218] border border-gray-800 rounded-2xl p-16 text-center space-y-4">
          <p className="text-4xl">🖼️</p>
          <h3 className="text-lg font-semibold text-gray-200">No saved edits yet</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Process a photo in AI Studio or export a collage in the Collage Editor to see it saved here.
          </p>
          <button
            onClick={() => setActiveTab('studio')}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-semibold transition"
          >
            Go to AI Studio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item, idx) => {
            const imgSrc = item.url || item.processedUrl || item.originalUrl;
            return (
              <div
                key={item.id || idx}
                className="bg-[#121218] border border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative h-56 bg-[#09090b] flex items-center justify-center p-4">
                  <img
                    src={imgSrc}
                    alt={item.type || 'Saved edit'}
                    className="max-h-full object-contain rounded-lg"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 border border-white/10 text-[11px] font-semibold uppercase text-purple-300">
                    {item.type || 'edit'}
                  </span>
                </div>

                <div className="p-4 border-t border-gray-800 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500">{item.createdAt || 'Saved'}</span>
                  <a
                    href={imgSrc}
                    download={`pixio-${item.type || 'edit'}-${item.id || idx}.png`}
                    className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition"
                  >
                    ⬇ Download HD
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}