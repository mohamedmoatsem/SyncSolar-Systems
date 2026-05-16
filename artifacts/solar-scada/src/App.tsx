import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { LanguageProvider } from "@/contexts/language-context";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { OfflineBanner } from "@/components/offline-banner";
import Dashboard from "@/pages/dashboard";
import Monitoring from "@/pages/monitoring";
import Devices from "@/pages/devices";
import Alerts from "@/pages/alerts";
import Logs from "@/pages/logs";
import AiAssistant from "@/pages/ai-assistant";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        const isNetworkError =
          error instanceof TypeError && error.message.includes("fetch");
        if (isNetworkError) return false;
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: () => React.ReactElement }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#090e1a" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#ff8c1a", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "#758ab0" }}>
            جارٍ التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#090e1a" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#ff8c1a", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "#758ab0" }}>
            جارٍ التحميل...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public auth routes — redirect to dashboard if already logged in */}
      <Route path="/login">
        {user ? <Redirect to="/" /> : <LoginPage />}
      </Route>
      <Route path="/register">
        {user ? <Redirect to="/" /> : <RegisterPage />}
      </Route>

      {/* Protected app routes */}
      <Route path="/">
        <ProtectedRoute component={() => (
          <Layout><OfflineBanner /><Dashboard /></Layout>
        )} />
      </Route>
      <Route path="/monitoring">
        <ProtectedRoute component={() => (
          <Layout><Monitoring /></Layout>
        )} />
      </Route>
      <Route path="/devices">
        <ProtectedRoute component={() => (
          <Layout><Devices /></Layout>
        )} />
      </Route>
      <Route path="/alerts">
        <ProtectedRoute component={() => (
          <Layout><Alerts /></Layout>
        )} />
      </Route>
      <Route path="/logs">
        <ProtectedRoute component={() => (
          <Layout><Logs /></Layout>
        )} />
      </Route>
      <Route path="/ai-assistant">
        <ProtectedRoute component={() => (
          <Layout><AiAssistant /></Layout>
        )} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
