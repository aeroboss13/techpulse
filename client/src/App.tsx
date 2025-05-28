import React from 'react';
import { Switch, Route, useLocation } from "wouter";
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
import Bookmarks from "@/pages/Bookmarks";
import Work from "@/pages/Work";
import Settings from "@/pages/Settings";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/components/LanguageProvider";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  React.useEffect(() => {
    // При изменении состояния аутентификации, перенаправляем
    if (!isLoading && !isAuthenticated) {
      console.log('Redirecting to login page (protected route)');
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center">Необходимо войти в систему для доступа к этой странице</p>
      </div>
    );
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/work" component={() => <ProtectedRoute component={Work} />} />
      <Route path="/snippets" component={() => <ProtectedRoute component={Snippets} />} />
      <Route path="/ai-assistant" component={() => <ProtectedRoute component={AIAssistant} />} />
      <Route path="/bookmarks" component={() => <ProtectedRoute component={Bookmarks} />} />
      <Route path="/profile/:userId" component={Profile} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
