'use client';

import React, { useState } from 'react';

export default function BillingModal({
  isOpen,
  onClose,
  user,
  credits,
  setCredits,
  triggerConfetti,
  triggerToast,
}) {
  const [selectedPack, setSelectedPack] = useState({
    credits: 100,
    amountInInr: 199,
    label: 'Pro Creator Pack',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const packs = [
    { credits: 25, amountInInr: 79, label: 'Starter Pack', badge: '' },
    { credits: 100, amountInInr: 199, label: 'Pro Creator Pack', badge: 'MOST POPULAR' },
    { credits: 300, amountInInr: 499, label: 'Studio Unlimited', badge: 'BEST VALUE' },
  ];

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRazorpayCheckout = async () => {
    if (!user?.email) {
      alert('Please sign in first.');
      return;
    }

    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay SDK failed to load');

      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountInInr: selectedPack.amountInInr,
          credits: selectedPack.credits,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Pixio AI Studio',
        description: `${selectedPack.credits} AI Studio Credits`,
        order_id: orderData.orderId,
        prefill: {
          name: user.name || 'Creator',
          email: user.email,
        },
        theme: { color: '#7c3aed' },
        handler: async function (response) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              email: user.email,
              credits: selectedPack.credits,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setCredits(verifyData.credits);
            if (triggerConfetti) triggerConfetti();
            if (triggerToast) {
              triggerToast(`Payment verified! +${selectedPack.credits} credits added.`);
            }
            onClose();
          } else {
            alert(verifyData.error || 'Payment verification failed');
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Unable to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#121215] border border-gray-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-sm"
        >
          ✕
        </button>

        <div className="mb-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            Pixio AI Billing
          </span>
          <h2 className="text-xl font-bold mt-1">Top Up Studio Credits</h2>
          <p className="text-xs text-gray-400 mt-1">
            Current balance: <span className="text-amber-400 font-semibold">{credits} Credits</span>
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {packs.map((pack) => {
            const active = selectedPack.credits === pack.credits;
            return (
              <div
                key={pack.credits}
                onClick={() => setSelectedPack(pack)}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  active
                    ? 'bg-purple-950/30 border-purple-500'
                    : 'bg-[#18181b] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{pack.credits} Credits</p>
                    {pack.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-300 font-semibold">
                        {pack.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{pack.label}</p>
                </div>
                <span className="text-lg font-bold text-white">₹{pack.amountInInr}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRazorpayCheckout}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition text-sm disabled:opacity-50"
        >
          {loading ? 'Opening Razorpay...' : `Pay ₹${selectedPack.amountInInr} with Razorpay`}
        </button>
      </div>
    </div>
  );
}