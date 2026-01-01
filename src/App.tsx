import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// --- DAFTAR HALAMAN ---
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Upgrade from "./pages/Upgrade";
import SharedChat from "./pages/SharedChat";
import Groups from "./pages/Groups";
import GroupChat from "./pages/GroupChat";
import NotFound from "./pages/NotFound";
// IMPORT HALAMAN BARU KITA
import JoinGroup from "./pages/JoinGroup"; 

const queryClient = new QueryClient();

/* =======================
   Protected Route (Penjaga Pintu)
   Hanya user yang sudah login boleh masuk
======================= */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

/* =======================
   App Root (Pusat Navigasi)
======================= */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Halaman Utama */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/shared/:conversationId" element={<SharedChat />} />

              {/* Halaman Chat AI */}
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              
              {/* Halaman Upgrade */}
              <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
              
              {/* Halaman Daftar Grup */}
              <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
              
              {/* Halaman Chat Grup */}
              <Route path="/groups/:groupId" element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />

              {/* --- INI RUTE BARU UNTUK LINK UNDANGAN --- */}
              {/* Kalau ada link /join/KODE, buka halaman JoinGroup */}
              <Route 
                path="/join/:inviteCode" 
                element={
                  <ProtectedRoute>
                    <JoinGroup />
                  </ProtectedRoute>
                } 
              />
              {/* ----------------------------------------- */}

              {/* Halaman Tidak Ditemukan (404) */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}