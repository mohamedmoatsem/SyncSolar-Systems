import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

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

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#090e1a" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: "#ff8c1a", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "#758ab0" }}>
          جارٍ التحميل...
        </p>
      </div>
    </div>
  );
}

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  /* ── Not logged in ── */
  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  /* ── Logged in ── */
  return (
    <Layout>
      <OfflineBanner />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/monitoring" component={Monitoring} />
        <Route path="/devices" component={Devices} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/logs" component={Logs} />
        <Route path="/ai-assistant" component={AiAssistant} />
        <Route path="/login">
          <Redirect to="/" />
        </Route>
        <Route path="/register">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppRouter />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
