import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Explore from "@/pages/Explore";
import Snippets from "@/pages/Snippets";
import AIAssistant from "@/pages/AIAssistant";
import Login from "@/pages/Login";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    window.location.href = "/api/login";
    return null;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/snippets" component={() => <ProtectedRoute component={Snippets} />} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/bookmarks" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {React.createElement(AuthProvider, {}, 
        React.createElement(LanguageProvider, {}, 
          React.createElement(ThemeProvider, {}, 
            React.createElement(TooltipProvider, {}, 
              React.createElement(Toaster, {}),
              React.createElement(Router, {})
            )
          )
        )
      )}
    </QueryClientProvider>
  );
}

export default App;
