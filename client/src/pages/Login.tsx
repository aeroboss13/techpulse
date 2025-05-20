import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/components/LanguageProvider';
import { useLocation } from 'wouter';
import { Loader2, Code, ArrowRight, User, Lock, Mail, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Неверный email или пароль');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('Успешный вход, данные:', data);
      toast({
        title: "Login successful",
        description: "Welcome back to DevStream!",
      });
      
      // Перенаправляем на главную страницу
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      setLoginSubmitting(false);
    }
  });
  
  const registerMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; username: string; password: string }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при регистрации');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('Успешная регистрация, данные:', data);
      toast({
        title: "Registration successful",
        description: "Your account has been created. You are now logged in!",
      });
      
      // Если сервер вернул успех и автологин сработал, перенаправляем на главную
      if (data.success && data.user) {
        window.location.href = '/';
      } else {
        // Иначе переключаемся на вкладку входа
        setActiveTab('login');
        setRegisterSubmitting(false);
        // Очищаем форму
        setRegisterName('');
        setRegisterEmail('');
        setRegisterUsername('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
      setRegisterSubmitting(false);
    }
  });

  useEffect(() => {
    document.title = "DevStream - Login";
    
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    
    setLoginSubmitting(true);
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerUsername || !registerPassword || !registerConfirmPassword) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }
    
    setRegisterSubmitting(true);
    registerMutation.mutate({ 
      name: registerName, 
      email: registerEmail, 
      username: registerUsername, 
      password: registerPassword
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-slate-900">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
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
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="login">{t('auth.signIn')}</TabsTrigger>
                <TabsTrigger value="register">{t('auth.signUp')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder={t('auth.enterEmail')}
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t('auth.password')}</Label>
                      <a href="#" className="text-xs text-primary hover:underline">
                        {t('auth.forgotPassword')}
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder={t('auth.enterPassword')}
                        className="pl-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={loginSubmitting}
                  >
                    {loginSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <User className="mr-2 h-4 w-4" />
                    )}
                    {loginSubmitting ? t('auth.loggingIn') : t('auth.signIn')}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('auth.fullName')}</Label>
                    <Input 
                      id="name" 
                      placeholder={t('auth.enterName')}
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">{t('auth.email')}</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder={t('auth.enterEmail')}
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('auth.username')}</Label>
                    <Input 
                      id="username" 
                      placeholder={t('auth.chooseUsername')}
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">{t('auth.password')}</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      placeholder={t('auth.createPassword')}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder={t('auth.confirmYourPassword')}
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={registerSubmitting}
                  >
                    {registerSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    {registerSubmitting ? t('auth.creatingAccount') : t('auth.createAccount')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
              <h3 className="font-medium flex items-center text-blue-700 dark:text-blue-300">
                <Code className="mr-2 h-5 w-5" />
                For Developers, By Developers
              </h3>
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                Share your code snippets, get feedback, and discover solutions to common programming challenges.
              </p>
            </div>
            
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2023 DevStream. All rights reserved.</p>
      </footer>
    </div>
  );
}
