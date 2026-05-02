import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout";
import { OfflineBanner } from "@/components/offline-banner";
import Dashboard from "@/pages/dashboard";
import Monitoring from "@/pages/monitoring";
import Devices from "@/pages/devices";
import Alerts from "@/pages/alerts";
import Logs from "@/pages/logs";
import AiAssistant from "@/pages/ai-assistant";

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

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/monitoring" component={Monitoring} />
        <Route path="/devices" component={Devices} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/logs" component={Logs} />
        <Route path="/ai-assistant" component={AiAssistant} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <OfflineBanner />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
