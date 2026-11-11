import React, { useState } from 'react';
import { X, Zap, CreditCard, Lock } from 'lucide-react';

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

export default function BillingModal({ isOpen, onClose, addCredits }) {
  const [selectedPack, setSelectedPack] = useState({ credits: 100, price: 9.99 });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12141C] max-w-md w-full rounded-3xl p-6 border border-white/15 space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-2xl font-extrabold text-white">Top Up Credits</h3>
          <p className="text-gray-400 text-xs">Purchase credits for background removals & upscaling.</p>
        </div>

        <div className="space-y-3">
          {[
            { credits: 50, price: 4.99 },
            { credits: 100, price: 9.99, popular: true },
            { credits: 500, price: 34.99 }
          ].map((pack) => (
            <div
              key={pack.credits}
              onClick={() => setSelectedPack(pack)}
              className={`p-4 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${
                selectedPack.credits === pack.credits
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-white/10 bg-[#161923]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-white">{pack.credits} Credits</span>
              </div>
              <span className="font-extrabold text-indigo-400">${pack.price}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            addCredits(selectedPack.credits);
            onClose();
            triggerConfetti();
          }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <CreditCard className="w-4 h-4" /> Pay & Add Credits Now
        </button>

        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>256-Bit SSL Encrypted Secure Checkout</span>
        </div>
      </div>
    </div>
  );
}