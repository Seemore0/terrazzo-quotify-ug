import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AppLayout from "./components/AppLayout";
import { AuthProvider } from "./hooks/useAuth";
import { PresetProvider } from "./lib/presetContext";
import { ThemeProvider } from "./hooks/useTheme";
import { Loader2 } from "lucide-react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Quotes = lazy(() => import("./pages/Quotes"));
const Customers = lazy(() => import("./pages/Customers"));
const CustomerProfile = lazy(() => import("./pages/CustomerProfile"));
const Reports = lazy(() => import("./pages/Reports"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <PresetProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Suspense fallback={<PageFallback />}><Dashboard /></Suspense>} />
                  <Route path="/quotes" element={<Suspense fallback={<PageFallback />}><Quotes /></Suspense>} />
                  <Route path="/customers" element={<Suspense fallback={<PageFallback />}><Customers /></Suspense>} />
                  <Route path="/customers/:id" element={<Suspense fallback={<PageFallback />}><CustomerProfile /></Suspense>} />
                  <Route path="/reports" element={<Suspense fallback={<PageFallback />}><Reports /></Suspense>} />
                  <Route path="/admin" element={<Suspense fallback={<PageFallback />}><AdminSettings /></Suspense>} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PresetProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
