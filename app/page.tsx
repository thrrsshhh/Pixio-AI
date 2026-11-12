'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HomeView from '@/components/HomeView';
import StudioView from '@/components/StudioView';
import EditorCanvas from '@/components/EditorCanvas';
import DashboardView from '@/components/DashboardView';
import BillingModal from '@/components/BillingModal';

export default function PixioApp() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [credits, setCredits] = useState(10);
  const [user, setUser] = useState<{ id?: string; name: string; email: string; credits?: number } | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  const [studioImg, setStudioImg] = useState('');
  const [processedImg, setProcessedImg] = useState('');
  const [selectedAction, setSelectedAction] = useState('bg-remove');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('Processing image...');
  const [collageSlots, setCollageSlots] = useState(['', '', '', '']);
  const [gallery, setGallery] = useState<any[]>([]);

  // 1. Restore logged-in user or redirect to /login
  useEffect(() => {
    const savedUser = localStorage.getItem('pixio_user');
    if (!savedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (typeof parsedUser.credits === 'number') {
        setCredits(parsedUser.credits);
      }
    } catch {
      localStorage.removeItem('pixio_user');
      router.push('/login');
      return;
    }
    setIsAuthChecked(true);
  }, [router]);

  // 2. Load saved history & latest DB credits for the logged-in user
  useEffect(() => {
    if (!user?.email) return;

    fetch(`/api/remove-bg?email=${encodeURIComponent(user.email)}`)
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
        } else {
          setGallery([]);
        }

        if (typeof data.credits === 'number') {
          setCredits(data.credits);
        }
      })
      .catch((err) => console.error('Failed to load user gallery:', err));
  }, [user?.email]);

  const updateCreditsAndPersist = (newCredits: number) => {
    setCredits(newCredits);
    if (user) {
      const updatedUser = { ...user, credits: newCredits };
      setUser(updatedUser);
      localStorage.setItem('pixio_user', JSON.stringify(updatedUser));
    }
  };

  const deductCredit = () => {
    if (credits <= 0) {
      alert('Out of credits! Please top up your credits to continue.');
      return false;
    }
    const next = credits - 1;
    updateCreditsAndPersist(next);
    return true;
  };

  const handleLogout = () => {
    setUser(null);
    setGallery([]);
    localStorage.removeItem('pixio_user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-[#090A0F] text-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0F] text-white flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        credits={credits}
        openPricingModal={() => setIsBillingModalOpen(true)}
        user={user}
        openAuthModal={() => router.push('/login')}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} />}

        {activeTab === 'studio' && (
          <StudioView
            user={user}
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
            onOpenInEditor={(imgUrl: string) => {
              if (!imgUrl) return;
              setCollageSlots((prev) => {
                const next = [...prev];
                const emptyIdx = next.findIndex((slot) => !slot);
                if (emptyIdx !== -1) next[emptyIdx] = imgUrl;
                else next[0] = imgUrl;
                return next;
              });
              setActiveTab('editor');
            }}
          />
        )}

        {activeTab === 'editor' && (
          <EditorCanvas
            user={user}
            collageSlots={collageSlots}
            setCollageSlots={setCollageSlots}
            gallery={gallery}
            setGallery={setGallery}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            gallery={gallery}
            setGallery={setGallery}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        user={user}
        credits={credits}
        setCredits={updateCreditsAndPersist}
        triggerConfetti={() => {}}
        triggerToast={(msg: string) => console.log(msg)}
      />
    </div>
  );
}