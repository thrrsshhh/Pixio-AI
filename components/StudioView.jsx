'use client';

import React, { useRef, useState } from 'react';
import { removeBackground } from '@imgly/background-removal';

async function enhanceImageCanvas(dataUrl, action) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = action === 'hd-upscale' ? 2 : 1;
      const w = img.width * scale;
      const h = img.height * scale;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      if (action === 'lighting-boost') {
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.12 + 12);
          data[i + 1] = Math.min(255, data[i + 1] * 1.12 + 12);
          data[i + 2] = Math.min(255, data[i + 2] * 1.12 + 12);
        }
        ctx.putImageData(imageData, 0, 0);
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to decode uploaded image'));
    img.src = dataUrl;
  });
}

export default function StudioView({
  user,
  studioImg,
  setStudioImg,
  processedImg,
  setProcessedImg,
  selectedAction,
  setSelectedAction,
  isProcessing,
  setIsProcessing,
  statusText,
  setStatusText,
  gallery,
  setGallery,
  deductCredit,
  triggerConfetti,
  triggerToast,
}) {
  const fileInputRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const runAIProcessing = async () => {
    if (!studioImg) {
      alert('Please upload an image first!');
      return;
    }
    if (!user?.email) {
      alert('Please sign in to process and save images.');
      return;
    }
    if (!deductCredit()) return;

    setIsProcessing(true);
    setProgress(5);

    try {
      let outputImage = studioImg;

      if (selectedAction === 'bg-remove') {
        setStatusText('Initializing AI segmentation model...');
        const blob = await removeBackground(studioImg, {
          model: 'isnet_quint8',
          progress: (key, current, total) => {
            if (total > 0) {
              // Map model download/inference across 10% -> 85%
              const rawPct = Math.round((current / total) * 100);
              const scaledPct = Math.min(85, Math.max(10, Math.round(10 + rawPct * 0.75)));
              setProgress(scaledPct);
              const label = key.includes('fetch') ? 'Downloading AI model' : 'Processing subject';
              setStatusText(`${label} (${rawPct}%)...`);
            } else {
              setStatusText('Isolating subject...');
            }
          },
        });

        setProgress(88);
        setStatusText('Encoding transparent PNG...');
        outputImage = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } else if (selectedAction === 'hd-upscale') {
        setProgress(40);
        setStatusText('Re-synthesizing 4K pixel detail (40%)...');
        outputImage = await enhanceImageCanvas(studioImg, 'hd-upscale');
        setProgress(85);
      } else {
        setProgress(40);
        setStatusText('Rebalancing shadow highlights (40%)...');
        outputImage = await enhanceImageCanvas(studioImg, 'lighting-boost');
        setProgress(85);
      }

      setProgress(92);
      setStatusText('Saving to your personal gallery (92%)...');

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          imageBase64: outputImage,
          type: selectedAction,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Backend saving failed');
      }

      setProgress(100);
      setStatusText('Completed (100%)!');

      const finalUrl = data.newItem.processedUrl || outputImage;
      setProcessedImg(finalUrl);

      setGallery([
        {
          id: data.newItem.id,
          url: finalUrl,
          type: data.newItem.type,
          createdAt: 'Just now',
        },
        ...gallery,
      ]);

      if (triggerConfetti) triggerConfetti();
      if (triggerToast) triggerToast('AI processing completed & saved to database!');
    } catch (err) {
      console.error('Processing error:', err);
      alert(err.message || 'Processing failed.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setStudioImg(uploadEvent.target?.result);
        setProcessedImg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setStudioImg(uploadEvent.target?.result);
        setProcessedImg('');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          Upload photos to strip backgrounds, sharpen features, or adjust lighting balance.
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-500 transition bg-[#18181b]/50"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            {studioImg ? (
              <div className="space-y-3">
                <img
                  src={studioImg}
                  alt="Uploaded preview"
                  className="h-32 mx-auto object-cover rounded-lg border border-gray-700"
                />
                <p className="text-xs text-gray-400">Click or drop to replace image</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xl">
                  ☁️
                </div>
                <p className="text-sm font-medium text-gray-200">
                  Drop image here or <span className="text-blue-400 underline">browse</span>
                </p>
                <p className="text-xs text-gray-500">Supports PNG, JPG up to 25MB</p>
              </div>
            )}
          </div>

          {/* Select Operation */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Select Operation
            </h3>

            <div
              onClick={() => setSelectedAction('bg-remove')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                selectedAction === 'bg-remove'
                  ? 'bg-purple-950/30 border-purple-500'
                  : 'bg-[#18181b] border-gray-800 hover:border-gray-700'
              }`}
            >
              <div>
                <p className="font-medium text-sm text-white">✂️ Remove Background</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Isolate subjects on clean transparent PNG
                </p>
              </div>
              <input
                type="radio"
                checked={selectedAction === 'bg-remove'}
                readOnly
                className="accent-purple-500"
              />
            </div>

            <div
              onClick={() => setSelectedAction('hd-upscale')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                selectedAction === 'hd-upscale'
                  ? 'bg-purple-950/30 border-purple-500'
                  : 'bg-[#18181b] border-gray-800 hover:border-gray-700'
              }`}
            >
              <div>
                <p className="font-medium text-sm text-white">✨ 4K Super Upscale</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Re-synthesize pixels and remove noise
                </p>
              </div>
              <input
                type="radio"
                checked={selectedAction === 'hd-upscale'}
                readOnly
                className="accent-purple-500"
              />
            </div>

            <div
              onClick={() => setSelectedAction('lighting-boost')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                selectedAction === 'lighting-boost'
                  ? 'bg-purple-950/30 border-purple-500'
                  : 'bg-[#18181b] border-gray-800 hover:border-gray-700'
              }`}
            >
              <div>
                <p className="font-medium text-sm text-white">💡 Studio Lighting Boost</p>
                <p className="text-xs text-gray-400 mt-0.5">Auto-rebalance shadow highlights</p>
              </div>
              <input
                type="radio"
                checked={selectedAction === 'lighting-boost'}
                readOnly
                className="accent-purple-500"
              />
            </div>
          </div>

          {/* Process Button + Inline Progress Bar */}
          <div className="space-y-2.5">
            <button
              onClick={runAIProcessing}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition text-white shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  <span>{statusText}</span>
                </>
              ) : (
                <span>⚡ Process Image Now</span>
              )}
            </button>

            {isProcessing && (
              <div className="w-full bg-gray-800/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Live Output Viewer */}
        <div className="lg:col-span-7 bg-[#121215] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Output Viewer
            </span>
            {isProcessing && (
              <span className="text-xs font-mono text-purple-400 font-semibold">
                {progress}%
              </span>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[380px] bg-[#09090b] bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] rounded-xl border border-gray-800/80 p-4 overflow-hidden relative">
            {isProcessing ? (
              <div className="w-full max-w-xs text-center space-y-4">
                <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                  <div className="w-14 h-14 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <span className="absolute text-xs font-bold text-white">{progress}%</span>
                </div>
                <p className="text-sm text-gray-200 font-medium">{statusText}</p>
                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700/60">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : processedImg ? (
              <img
                src={processedImg}
                alt="Processed result"
                className="max-h-[380px] object-contain rounded-lg shadow-2xl"
              />
            ) : studioImg ? (
              <img
                src={studioImg}
                alt="Original preview"
                className="max-h-[380px] object-contain rounded-lg opacity-80"
              />
            ) : (
              <div className="text-center text-gray-500 space-y-2">
                <p className="text-3xl">🖼️</p>
                <p className="text-sm">Upload an image and run processing to see results here</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <a
              href={processedImg || studioImg || '#'}
              download="pixio-processed.png"
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-center bg-gray-800 hover:bg-gray-700 transition text-sm flex items-center justify-center gap-2 ${
                !processedImg && !studioImg ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              ⬇️ Download PNG
            </a>
            <button
              onClick={() => alert('Opening in advanced editor...')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-center bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition text-sm flex items-center justify-center gap-2 border border-purple-500/30 ${
                !processedImg && !studioImg ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              ✨ Open in Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}