import React, { useState } from 'react';
import { LayoutGrid, Download, Sliders, UploadCloud, Palette, Type, RotateCcw } from 'lucide-react';

function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 60 }, () => ({
    x: canvas.width / 2,
    y: canvas.height * 0.7,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -12 - 4,
    size: Math.random() * 8 + 4,
    color: ['#06b6d4', '#6366f1', '#ec4899', '#f59e0b', '#10b981'][Math.floor(Math.random() * 5)],
    alpha: 1
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.alpha -= 0.015;

      if (p.alpha > 0) {
        active = true;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (active) requestAnimationFrame(animate);
    else canvas.remove();
  }

  animate();
}

export default function EditorCanvas({ collageSlots, setCollageSlots, gallery, setGallery }) {
  const [collageRadius, setCollageRadius] = useState(16);
  const [collageGap, setCollageGap] = useState(12);
  const [stickerText, setStickerText] = useState("SUMMER '26");
  const [canvasBg, setCanvasBg] = useState('linear-gradient(135deg, #111827, #312E81)');

  const exportCollage = async () => {
    triggerConfetti();
    const collageUrl = collageSlots[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe';
    
    const newCollage = {
      id: Date.now().toString(),
      title: 'Collage Design #' + (gallery.length + 1),
      type: 'collage',
      url: collageUrl,
      createdAt: 'Just now'
    };
    
    setGallery([newCollage, ...gallery]);

    // Save collage to database history
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: collageUrl,
          processedUrl: collageUrl,
          type: 'collage'
        })
      });
    } catch (err) {
      console.error('Failed to save collage to database', err);
    }
  };

  const handleSlotUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const updatedSlots = [...collageSlots];
        updatedSlots[index] = uploadEvent.target.result;
        setCollageSlots(updatedSlots);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCanvas = () => {
    setCollageRadius(16);
    setCollageGap(12);
    setStickerText("SUMMER '26");
    setCanvasBg('linear-gradient(135deg, #111827, #312E81)');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
            <LayoutGrid className="w-7 h-7 text-indigo-400" /> Smart Canvas Editor
          </h2>
          <p className="text-gray-400 text-sm mt-1">Construct multi-photo layouts with dynamic gaps, background gradients, and labels.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetCanvas}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={exportCollage}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export HD Collage
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-[#12141C] p-5 rounded-2xl border border-white/10 space-y-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" /> Styling Customizer
          </h4>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" /> Canvas Background
            </label>
            <div className="flex gap-2">
              {[
                'linear-gradient(135deg, #111827, #312E81)',
                '#090A0F',
                '#1E1B4B',
                'linear-gradient(135deg, #090A0F, #06B6D4)'
              ].map((bg, idx) => (
                <button
                  key={idx}
                  onClick={() => setCanvasBg(bg)}
                  style={{ background: bg }}
                  className="w-8 h-8 rounded-full border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-300">
              <span>Corner Radius</span>
              <span className="text-cyan-400 font-mono">{collageRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={collageRadius}
              onChange={(e) => setCollageRadius(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-300">
              <span>Cell Spacing</span>
              <span className="text-cyan-400 font-mono">{collageGap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={collageGap}
              onChange={(e) => setCollageGap(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-cyan-400" /> Add Text Label
            </label>
            <input
              type="text"
              value={stickerText}
              onChange={(e) => setStickerText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#161923] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <p className="text-[10px] text-gray-500 italic pt-2">Tip: Hover on canvas cells to upload or change image photos individually.</p>
        </div>

        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-[#12141C] p-6 rounded-2xl border border-white/10 min-h-[500px]">
          <div
            className="w-full max-w-[460px] aspect-square rounded-2xl p-4 border border-white/10 shadow-2xl relative flex flex-col justify-between"
            style={{ background: canvasBg }}
          >
            <div
              className="w-full h-full grid grid-cols-2"
              style={{ gap: `${collageGap}px` }}
            >
              {collageSlots.map((url, index) => (
                <div
                  key={index}
                  className="overflow-hidden relative group border border-white/10 bg-black/40 flex items-center justify-center"
                  style={{ borderRadius: `${collageRadius}px` }}
                >
                  {url ? (
                    <img
                      src={url}
                      alt={`Collage frame ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">Slot {index + 1}</span>
                  )}

                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs cursor-pointer transition-opacity">
                    <UploadCloud className="w-5 h-5 mb-1 text-cyan-400" />
                    <span>{url ? 'Change Image' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSlotUpload(e, index)}
                    />
                  </label>
                </div>
              ))}
            </div>

            {stickerText && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-extrabold tracking-widest uppercase text-white shadow-xl">
                {stickerText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}