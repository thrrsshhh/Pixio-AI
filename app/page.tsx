'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HomeView from '@/components/HomeView';
import StudioView from '@/components/StudioView';
import EditorCanvas from '@/components/EditorCanvas';
import DashboardView from '@/components/DashboardView';
import AuthModal from '@/components/AuthModal';
import BillingModal from '@/components/BillingModal';

export default function PixioApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [credits, setCredits] = useState(10);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  const [studioImg, setStudioImg] = useState('');
  const [processedImg, setProcessedImg] = useState('');
  const [selectedAction, setSelectedAction] = useState('bg-remove');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('Processing image...');
  const [collageSlots, setCollageSlots] = useState(['', '', '', '']);
  const [gallery, setGallery] = useState<any[]>([]);

  // Load saved history from SQLite on startup
  useEffect(() => {
    fetch('/api/remove-bg')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.history)) {
          setGallery(
            data.history.map((item: any) => ({
              id: item.id,
              url: item.processedUrl || item.originalUrl,
              type: item.type,
              createdAt: new Date(item.createdAt).toLocaleDateString(),
            }))
          );
        }
      })
      .catch((err) => console.error('Failed to load gallery:', err));
  }, []);

  const deductCredit = () => {
    if (credits <= 0) {
      alert('Out of credits! Please top up your credits to continue.');
      return false;
    }
    setCredits((prev) => prev - 1);
    return true;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    alert('Logged out successfully!');
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-white flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        credits={credits}
        openPricingModal={() => setIsBillingModalOpen(true)}
        user={user}
        openAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} />}

        {activeTab === 'studio' && (
          <StudioView
            studioImg={studioImg}
            setStudioImg={setStudioImg}
            processedImg={processedImg}
            setProcessedImg={setProcessedImg}
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            statusText={statusText}
            setStatusText={setStatusText}
            deductCredit={deductCredit}
            gallery={gallery}
            setGallery={setGallery}
            triggerConfetti={() => {}}
            triggerToast={(msg: string) => console.log(msg)}
          />
        )}

        {activeTab === 'editor' && (
          <EditorCanvas
            collageSlots={collageSlots}
            setCollageSlots={setCollageSlots}
            gallery={gallery}
            setGallery={setGallery}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            gallery={gallery}
            setGallery={setGallery}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(userData: any) => setUser(userData)}
      />

      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        addCredits={(amt: number) => setCredits((c) => c + amt)}
      />
    </div>
  );
}