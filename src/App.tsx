
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import MainPage from "./pages/MainPage";

// Use React's lazy loading only for auth pages that are true routes
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // prevents unnecessary refetches when switching tabs
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Loading component for suspense fallback
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin h-10 w-10 border-4 border-petpal-blue border-t-transparent rounded-full"></div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (!user) {
    // Store the attempted URL to redirect back after login
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    sessionStorage.setItem('redirectAfterLogin', currentPath);
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        <Route path="/pet/:petId" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
