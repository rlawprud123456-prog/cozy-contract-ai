import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BottomNav from "./components/layout/BottomNav";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import AllMenu from "./pages/AllMenu";
import Cases from "./pages/Cases";
import Community from "./pages/Community";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Admin from "./pages/Admin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import AdminPartners from "./pages/admin/Partners";
import Contracts from "./pages/admin/Contracts";
import Estimates from "./pages/admin/Estimates";
import Payments from "./pages/admin/Payments";
import DamageReports from "./pages/admin/DamageReports";
import Featured from "./pages/admin/Featured";
import Profile from "./pages/Profile";
import ContractReview from "./pages/ContractReview";
import History from "./pages/History";
import Match from "./pages/Match";
import Partners from "./pages/Partners";
import PartnerList from "./pages/PartnerList";
import ScammerSearch from "./pages/ScammerSearch";
import DamageHistory from "./pages/DamageHistory";
import DamageReport from "./pages/DamageReport";
import ContractCreate from "./pages/ContractCreate";
import Escrow from "./pages/Escrow";
import PartnerApply from "./pages/PartnerApply";
import Sad from "./pages/community/Sad";
import Unfair from "./pages/community/Unfair";
import DiyTips from "./pages/community/DiyTips";
import Jobs from "./pages/community/Jobs";
import Help from "./pages/community/Help";
import PostDetailPage from "./pages/community/PostDetailPage";
import Reviews from "./pages/Reviews";
import ReviewWrite from "./pages/ReviewWrite";
import EstimatePage from "./pages/EstimatePage";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import FeaturedHistory from "./pages/FeaturedHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import AIInterior from "./pages/AIInterior";
import CommunityManagement from "./pages/admin/Community";
import EvidenceManager from "./pages/admin/EvidenceManager";
import PartnerCenter from "./pages/PartnerCenter";
import EvidencePackage from "./pages/EvidencePackage";
import PartnerLogin from "./pages/PartnerLogin";
import EstimateRequests from "./pages/EstimateRequests";
import SupportPage from "./pages/SupportPage";
import PartnerDetail from "./pages/PartnerDetail";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Signup from "./pages/Signup";
import PartnerProfile from "./pages/PartnerProfile";
import SafeChatPage from "./pages/SafeChatPage";
import EscrowTimeline from "./components/EscrowTimeline";
import SafeIdeaBook from "./components/SafeIdeaBook";

const queryClient = new QueryClient();

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    navigate("/");
  };

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      {!isHomePage && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/partner-login" element={<PartnerLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/admin-old" element={<Admin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="estimates" element={<Estimates />} />
            <Route path="payments" element={<Payments />} />
            <Route path="damage-reports" element={<DamageReports />} />
            <Route path="featured" element={<Featured />} />
            <Route path="community" element={<CommunityManagement />} />
            <Route path="evidence" element={<EvidenceManager />} />
          </Route>
          <Route path="/contract-create" element={<ContractCreate user={user} />} />
          <Route path="/escrow" element={<Escrow user={user} />} />
          <Route path="/contract-review" element={<ContractReview user={user} />} />
          <Route path="/estimate" element={<EstimatePage />} />
          <Route path="/match" element={<Match />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/partners/detail/:id" element={<PartnerDetail />} />
          <Route path="/ai-interior" element={<AIInterior />} />
          <Route path="/partners/:category" element={<PartnerList />} />
          <Route path="/scammer-search" element={<ScammerSearch />} />
          <Route path="/damage-history" element={<DamageHistory />} />
          <Route path="/damage-report" element={<DamageReport />} />
          <Route path="/profile" element={<ProtectedRoute><Profile user={user} /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/partner/apply" element={<PartnerApply />} />
          <Route path="/community/sad" element={<Sad />} />
          <Route path="/community/unfair" element={<Unfair />} />
          <Route path="/community/diy-tips" element={<DiyTips />} />
          <Route path="/community/jobs" element={<Jobs />} />
          <Route path="/community/help" element={<Help />} />
          <Route path="/community/post/:id" element={<PostDetailPage />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/reviews/write" element={<ReviewWrite />} />
          <Route path="/partner-center" element={<ProtectedRoute><PartnerCenter /></ProtectedRoute>} />
          <Route path="/evidence-package" element={<ProtectedRoute><EvidencePackage /></ProtectedRoute>} />
          <Route path="/install" element={<Install />} />
          <Route path="/all-menu" element={<AllMenu />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/community" element={<Community />} />
          <Route path="/estimate-requests" element={<ProtectedRoute><EstimateRequests /></ProtectedRoute>} />
          <Route path="/featured-history" element={<ProtectedRoute><FeaturedHistory /></ProtectedRoute>} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/partner-profile" element={<PartnerProfile />} />
          <Route path="/safe-chat" element={<SafeChatPage />} />
          {/* 테스트용 라우트 */}
          <Route path="/test/partner-profile" element={<PartnerProfile />} />
          <Route path="/test/safe-chat" element={<SafeChatPage />} />
          <Route path="/test/escrow" element={<EscrowTimeline />} />
          <Route path="/test/ideabook" element={<SafeIdeaBook />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isHomePage && <Footer />}
      <Chatbot />
      <BottomNav />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
