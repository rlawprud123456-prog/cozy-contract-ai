import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ContractReview from "./pages/ContractReview";
import History from "./pages/History";
import Match from "./pages/Match";
import Partners from "./pages/Partners";
import PartnerList from "./pages/PartnerList";
import ScammerSearch from "./pages/ScammerSearch";
import ContractCreate from "./pages/ContractCreate";
import Escrow from "./pages/Escrow";
import PartnerApply from "./pages/PartnerApply";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { auth } from "./services/api";

const queryClient = new QueryClient();

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    auth.me().then(res => setUser(res.user));
  }, []);

  const logout = async () => {
    await auth.logout();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={logout} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/signup" element={<Signup onSignup={setUser} />} />
          <Route path="/contract/create" element={<ContractCreate user={user} />} />
          <Route path="/escrow" element={<Escrow user={user} />} />
          <Route path="/review" element={<ContractReview user={user} />} />
          <Route path="/match" element={<Match />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/partners/:category" element={<PartnerList />} />
          <Route path="/scam" element={<ScammerSearch />} />
          <Route path="/profile" element={<ProtectedRoute user={user}><Profile user={user} /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute user={user}><History /></ProtectedRoute>} />
          <Route path="/partner/apply" element={<PartnerApply />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
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
