import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Integrations from "@/pages/integrations";
import Tickets from "@/pages/tickets";
import Chat from "@/pages/chat";
import Analytics from "@/pages/analytics";
import Logs from "@/pages/logs";
import Navigation from "@/components/layout/navigation";

function Router() {
  return (
    <div className="flex flex-col h-screen bg-dark-navy">
      <Navigation />
      <div className="flex-1 overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/integrations" component={Integrations} />
          <Route path="/tickets" component={Tickets} />
          <Route path="/chat" component={Chat} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/logs" component={Logs} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
