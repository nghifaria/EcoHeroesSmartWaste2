import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Onboarding } from "@/components/Onboarding";
import { AuthPage } from "@/components/AuthPage";
import { MainLayout } from "@/components/MainLayout";
import { Dashboard } from "@/components/Dashboard";
import { ChallengesPage } from "@/components/ChallengesPage";
import { ProfilePage } from "@/components/ProfilePage";
import { LeaderboardPage } from "@/components/LeaderboardPage";
import { SettingsPage } from "@/components/SettingsPage";
import { ReportModal } from "@/components/ReportModal";
import { EcoBotChat } from "@/components/EcoBotChat";
import NotFound from "./pages/NotFound";
import { supabase } from "./integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const queryClient = new QueryClient();

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [session, setSession] = useState<User | null>(null); // Ganti isAuthenticated menjadi session
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('ecoheroes_onboarding_complete');
    if (hasSeenOnboarding) {
      setShowOnboarding(false);
    }
    
    // Cek sesi pengguna saat aplikasi dimuat
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSession(user);
    });

    // Dengarkan perubahan status otentikasi
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('ecoheroes_onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  // onAuthSuccess tidak lagi diperlukan karena kita menggunakan onAuthStateChange
  const handleAuthSuccess = () => {};

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleReportSuccess = () => {
    console.log('Report submitted successfully');
  };

  const userName = session?.user_metadata?.full_name || "EcoHero";

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!session) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard 
            onReportClick={() => setIsReportModalOpen(true)}
            onNavigate={handleNavigate}
            userName={userName}
          />;
      case 'challenges':
        return <ChallengesPage />;
      case 'leaderboard':
        return <LeaderboardPage />;  
      case 'profile':
        return <ProfilePage 
            onNavigate={handleNavigate}
            userName={userName}
            userEmail={session.email}
          />;
      case 'settings':
        return <SettingsPage user={session} />;
      default:
        return <Dashboard 
            onReportClick={() => setIsReportModalOpen(true)}
            onNavigate={handleNavigate}
            userName={userName}
          />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MainLayout
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onReportClick={() => setIsReportModalOpen(true)}
          onChatClick={() => setIsChatOpen(true)}
          userName={userName}
        >
          {renderCurrentPage()}
        </MainLayout>
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSuccess={handleReportSuccess}
        />
        <EcoBotChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;