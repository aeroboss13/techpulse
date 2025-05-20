import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Loader2, Code, ArrowRight } from 'lucide-react';

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "DevStream - Login";
    
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-slate-900">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <CardTitle className="text-2xl">Welcome to DevStream</CardTitle>
            <CardDescription>
              A social platform for developers to share code, discuss tech, and connect with other professionals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium flex items-center text-blue-700 dark:text-blue-300">
                  <Code className="mr-2 h-5 w-5" />
                  For Developers, By Developers
                </h3>
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  Share your code snippets, get feedback, and discover solutions to common programming challenges.
                </p>
              </div>
              
              <Button 
                asChild 
                className="w-full"
                size="lg"
              >
                <a href="/api/login" className="flex items-center justify-center">
                  <span>Sign in to continue</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2023 DevStream. All rights reserved.</p>
      </footer>
    </div>
  );
}
