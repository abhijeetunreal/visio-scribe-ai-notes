
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();

// IMPORTANT: Replace with your Google Client ID from https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = "555830511813-0eueoh9cnt8tr94jfach4uqhakkedt8o.apps.googleusercontent.com";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Index />
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
