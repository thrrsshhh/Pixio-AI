'use client';

import React, { useState } from 'react';

const TEMPLATES = [
  { id: 'grid-2x2', name: '4-Grid Classic', slots: 4 },
  { id: 'split-2', name: '2-Photo Split', slots: 2 },
  { id: 'hero-3', name: '3-Photo Hero', slots: 3 },
  { id: 'strip-3', name: '3-Photo Strip', slots: 3 },
  { id: 'bento-5', name: '5-Photo Bento', slots: 5 },
  { id: 'grid-3x2', name: '6-Grid Moodboard', slots: 6 },
];

const BG_PRESETS = [
  { id: 'navy', label: 'Midnight Navy', css: 'linear-gradient(135deg, #1e2246 0%, #141730 100%)', c1: '#1e2246', c2: '#141730' },
  { id: 'obsidian', label: 'Obsidian', css: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)', c1: '#18181b', c2: '#09090b' },
  { id: 'plum', label: 'Royal Plum', css: 'linear-gradient(135deg, #3b1d5e 0%, #1d1136 100%)', c1: '#3b1d5e', c2: '#1d1136' },
  { id: 'teal', label: 'Deep Teal', css: 'linear-gradient(135deg, #134e4a 0%, #0f172a 100%)', c1: '#134e4a', c2: '#0f172a' },
  { id: 'white', label: 'Clean White', css: 'linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%)', c1: '#ffffff', c2: '#f4f4f5' },
];

function getLayoutRects(templateId) {
  switch (templateId) {
    case 'split-2':
      return [
        [0, 0, 0.5, 1],
        [0.5, 0, 0.5, 1],
      ];
    case 'hero-3':
      return [
        [0, 0, 0.5, 1],
        [0.5, 0, 0.5, 0.5],
        [0.5, 0.5, 0.5, 0.5],
      ];
    case 'strip-3':
      return [
        [0, 0, 1 / 3, 1],
        [1 / 3, 0, 1 / 3, 1],
        [2 / 3, 0, 1 / 3, 1],
      ];
    case 'bento-5':
      return [
        [0, 0, 0.5, 0.55],
        [0.5, 0, 0.5, 0.55],
        [0, 0.55, 1 / 3, 0.45],
        [1 / 3, 0.55, 1 / 3, 0.45],
        [2 / 3, 0.55, 1 / 3, 0.45],
      ];
    case 'grid-3x2':
      return [
        [0, 0, 1 / 3, 0.5],
        [1 / 3, 0, 1 / 3, 0.5],
        [2 / 3, 0, 1 / 3, 0.5],
        [0, 0.5, 1 / 3, 0.5],
        [1 / 3, 0.5, 1 / 3, 0.5],
        [2 / 3, 0.5, 1 / 3, 0.5],
      ];
    case 'grid-2x2':
    default:
      return [
        [0, 0, 0.5, 0.5],
        [0.5, 0, 0.5, 0.5],
        [0, 0.5, 0.5, 0.5],
        [0.5, 0.5, 0.5, 0.5],
      ];
  }
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export default function EditorCanvas({
  user,
  collageSlots = ['', '', '', '', '', ''],
  setCollageSlots,
  gallery = [],
  setGallery,
}) {
  const [template, setTemplate] = useState('grid-2x2');
  const [bgPreset, setBgPreset] = useState(BG_PRESETS[0]);
  const [cornerRadius, setCornerRadius] = useState(16);
  const [cellSpacing, setCellSpacing] = useState(12);
  const [labelText, setLabelText] = useState("SUMMER '26");
  const [isExporting, setIsExporting] = useState(false);

  const slots = Array.from({ length: 6 }, (_, i) => collageSlots[i] || '');
  const activeTemplate = TEMPLATES.find((t) => t.id === template) || TEMPLATES[0];
  const rects = getLayoutRects(template);

  const updateSlot = (index, dataUrl) => {
    const next = [...slots];
    next[index] = dataUrl;
    if (setCollageSlots) setCollageSlots(next);
  };

  const handleCellFileChange = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        updateSlot(index, ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (setCollageSlots) setCollageSlots(['', '', '', '', '', '']);
    setLabelText('');
    setCornerRadius(16);
    setCellSpacing(12);
  };

  const handleExportHD = async () => {
    setIsExporting(true);
    try {
      const SIZE = 1200;
      const scale = SIZE / 520;
      const pad = Math.max(20, cellSpacing * scale * 1.5);
      const gap = cellSpacing * scale;
      const radius = cornerRadius * scale;

      // 1. Preload all images first so canvas clip() states never overlap
      const loadedImages = await Promise.all(
        rects.map(async (_, idx) => {
          const src = slots[idx];
          if (!src) return null;

          let loadSrc = src;
          let revokeAfter = false;
          if (src.startsWith('http')) {
            try {
              const res = await fetch(src);
              const blob = await res.blob();
              loadSrc = URL.createObjectURL(blob);
              revokeAfter = true;
            } catch {
              loadSrc = src;
            }
          }

          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              if (revokeAfter) URL.revokeObjectURL(loadSrc);
              resolve(img);
            };
            img.onerror = () => {
              if (revokeAfter) URL.revokeObjectURL(loadSrc);
              resolve(null);
            };
            img.src = loadSrc;
          });
        })
      );

      // 2. Render collage onto 1200x1200 HD canvas
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
      grad.addColorStop(0, bgPreset.c1);
      grad.addColorStop(1, bgPreset.c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SIZE, SIZE);

      const innerW = SIZE - pad * 2;
      const innerH = SIZE - pad * 2;

      rects.forEach(([nx, ny, nw, nh], idx) => {
        const x = pad + nx * innerW + gap / 2;
        const y = pad + ny * innerH + gap / 2;
        const w = nw * innerW - gap;
        const h = nh * innerH - gap;

        ctx.save();
        drawRoundedRect(ctx, x, y, w, h, radius);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fill();
        ctx.clip();

        const img = loadedImages[idx];
        if (img) {
          const coverScale = Math.max(w / img.width, h / img.height);
          const dw = img.width * coverScale;
          const dh = img.height * coverScale;
          const dx = x + (w - dw) / 2;
          const dy = y + (h - dh) / 2;
          ctx.drawImage(img, dx, dy, dw, dh);
        }
        ctx.restore();
      });

      // 3. Draw bottom pill label
      if (labelText.trim()) {
        ctx.save();
        ctx.font = 'bold 34px sans-serif';
        const textMetrics = ctx.measureText(labelText.trim());
        const pillW = textMetrics.width + 72;
        const pillH = 68;
        const pillX = (SIZE - pillW) / 2;
        const pillY = SIZE - pad - pillH - 16;

        drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 34);
        ctx.fillStyle = 'rgba(15, 17, 26, 0.88)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText.trim(), SIZE / 2, pillY + pillH / 2 + 2);
        ctx.restore();
      }

      // 4. Download HD PNG locally
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `pixio-collage-${template}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 5. Save collage to SQLite database under this specific user
      if (user?.email) {
        try {
          const saveRes = await fetch('/api/remove-bg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              imageBase64: dataUrl,
              type: 'collage',
            }),
          });
          const saveData = await saveRes.json();
          if (saveData.success && saveData.newItem && setGallery) {
            setGallery([
              {
                id: saveData.newItem.id,
                url: saveData.newItem.processedUrl || dataUrl,
                type: 'collage',
                createdAt: 'Just now',
              },
              ...gallery,
            ]);
          }
        } catch (dbErr) {
          console.error('Failed to save collage to dashboard history:', dbErr);
        }
      }
    } catch (err) {
      console.error('Export collage failed:', err);
      alert('Could not export collage.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-white space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2.5">
            <span className="text-purple-400">⊞</span> Smart Canvas Editor
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Construct multi-photo layouts with dynamic gaps, background gradients, and labels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-[#18181b] hover:bg-gray-800 border border-gray-800 text-sm font-medium text-gray-300 transition"
          >
            ↺ Reset
          </button>
          <button
            onClick={handleExportHD}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition disabled:opacity-50"
          >
            {isExporting ? 'Exporting & Saving...' : '⬇ Export HD Collage'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Customizer Panel */}
        <div className="lg:col-span-5 bg-[#121218] border border-gray-800/80 rounded-2xl p-6 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            🎛️ Styling Customizer
          </h2>

          {/* Collage Templates Selector */}
          <div className="space-y-2.5">
            <label className="text-xs text-gray-300 font-medium block">Collage Template</label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={`px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition ${
                    template === t.id
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-[#18181f] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Background */}
          <div className="space-y-2.5">
            <label className="text-xs text-gray-300 font-medium block">🎨 Canvas Background</label>
            <div className="flex items-center gap-3">
              {BG_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.label}
                  onClick={() => setBgPreset(preset)}
                  style={{ background: preset.css }}
                  className={`w-9 h-9 rounded-full border-2 transition ${
                    bgPreset.id === preset.id
                      ? 'border-purple-400 scale-110 shadow-md'
                      : 'border-white/20 opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Corner Radius */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">Corner Radius</span>
              <span className="text-blue-400 font-semibold">{cornerRadius}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              value={cornerRadius}
              onChange={(e) => setCornerRadius(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Cell Spacing */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">Cell Spacing</span>
              <span className="text-blue-400 font-semibold">{cellSpacing}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={32}
              value={cellSpacing}
              onChange={(e) => setCellSpacing(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Add Text Label */}
          <div className="space-y-2">
            <label className="text-xs text-gray-300 font-medium block">T Add Text Label</label>
            <input
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              placeholder="e.g. SUMMER '26"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181f] border border-gray-800 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Quick-add from History */}
          {gallery.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <label className="text-xs text-gray-400 block">
                Click a saved photo to add to next slot:
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.slice(0, 8).map((item, i) => {
                  const imgUrl = item.url || item.processedUrl || item.originalUrl;
                  return (
                    <button
                      key={item.id || i}
                      type="button"
                      onClick={() => {
                        const emptyIdx = slots
                          .slice(0, activeTemplate.slots)
                          .findIndex((s) => !s);
                        updateSlot(emptyIdx !== -1 ? emptyIdx : 0, imgUrl);
                      }}
                      className="w-11 h-11 rounded-lg border border-gray-700 overflow-hidden shrink-0 hover:border-purple-500 transition"
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-[11px] text-gray-500 italic">
            Tip: Click any canvas cell on the right to upload or replace a photo individually.
          </p>
        </div>

        {/* Right Interactive Collage Preview */}
        <div className="lg:col-span-7 bg-[#121218] border border-gray-800/80 rounded-2xl p-6 flex items-center justify-center">
          <div
            style={{
              background: bgPreset.css,
              padding: `${Math.max(12, cellSpacing * 1.4)}px`,
            }}
            className="relative w-full max-w-[520px] aspect-square rounded-2xl shadow-2xl overflow-hidden transition-all"
          >
            <div className="relative w-full h-full">
              {rects.map(([nx, ny, nw, nh], idx) => {
                const imgSrc = slots[idx];
                return (
                  <label
                    key={idx}
                    style={{
                      left: `calc(${nx * 100}% + ${cellSpacing / 2}px)`,
                      top: `calc(${ny * 100}% + ${cellSpacing / 2}px)`,
                      width: `calc(${nw * 100}% - ${cellSpacing}px)`,
                      height: `calc(${nh * 100}% - ${cellSpacing}px)`,
                      borderRadius: `${cornerRadius}px`,
                    }}
                    className="absolute overflow-hidden cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center group transition-all"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCellFileChange(idx, e)}
                      className="hidden"
                    />
                    {imgSrc ? (
                      <>
                        <img
                          src={imgSrc}
                          alt={`Slot ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-medium text-white transition">
                          Replace Photo
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-2">
                        <span className="text-lg block text-gray-400">+</span>
                        <span className="text-[11px] text-gray-400">Slot {idx + 1}</span>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>

            {labelText.trim() && (
              <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none">
                <span className="px-5 py-2 rounded-full bg-[#0f111a]/90 border border-white/15 text-xs font-bold tracking-wide text-white shadow-xl">
                  {labelText.trim()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}