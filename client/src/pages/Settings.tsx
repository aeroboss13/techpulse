import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

export default function Settings() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  
  const handleLanguageChange = (newLanguage: 'en' | 'ru') => {
    setLanguage(newLanguage);
    toast({
      title: language === 'ru' ? "Язык изменен" : "Language changed",
      description: language === 'ru' ? "Настройки языка обновлены" : "Language settings updated",
    });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast({
      title: language === 'ru' ? "Тема изменена" : "Theme changed",
      description: language === 'ru' ? "Тема интерфейса обновлена" : "Interface theme updated",
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center space-x-2 mb-8">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'ru' ? 'Настройки' : 'Settings'}
          </h1>
        </div>

        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>{language === 'ru' ? 'Профиль' : 'Profile'}</CardTitle>
              </div>
              <CardDescription>
                {language === 'ru' ? 'Управление информацией профиля' : 'Manage your profile information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{language === 'ru' ? 'Имя' : 'First Name'}</Label>
                  <Input
                    id="firstName"
                    defaultValue={user?.firstName || ''}
                    placeholder={language === 'ru' ? 'Введите имя' : 'Enter first name'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{language === 'ru' ? 'Фамилия' : 'Last Name'}</Label>
                  <Input
                    id="lastName"
                    defaultValue={user?.lastName || ''}
                    placeholder={language === 'ru' ? 'Введите фамилию' : 'Enter last name'}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{language === 'ru' ? 'Email' : 'Email'}</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email || ''}
                  placeholder={language === 'ru' ? 'Введите email' : 'Enter email'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">{language === 'ru' ? 'О себе' : 'Bio'}</Label>
                <Input
                  id="bio"
                  placeholder={language === 'ru' ? 'Расскажите о себе' : 'Tell us about yourself'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>{language === 'ru' ? 'Внешний вид' : 'Appearance'}</CardTitle>
              </div>
              <CardDescription>
                {language === 'ru' ? 'Настройки темы и языка интерфейса' : 'Theme and language preferences'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{language === 'ru' ? 'Тема' : 'Theme'}</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ru' ? 'Выберите светлую или темную тему' : 'Choose light or dark theme'}
                  </p>
                </div>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{language === 'ru' ? 'Светлая' : 'Light'}</SelectItem>
                    <SelectItem value="dark">{language === 'ru' ? 'Темная' : 'Dark'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{language === 'ru' ? 'Язык' : 'Language'}</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ru' ? 'Выберите язык интерфейса' : 'Choose interface language'}
                  </p>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>{language === 'ru' ? 'Уведомления' : 'Notifications'}</CardTitle>
              </div>
              <CardDescription>
                {language === 'ru' ? 'Управление уведомлениями' : 'Manage your notification preferences'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{language === 'ru' ? 'Email уведомления' : 'Email notifications'}</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ru' ? 'Получать уведомления на email' : 'Receive notifications via email'}
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{language === 'ru' ? 'Push уведомления' : 'Push notifications'}</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ru' ? 'Получать уведомления в браузере' : 'Receive browser notifications'}
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>{language === 'ru' ? 'Приватность' : 'Privacy'}</CardTitle>
              </div>
              <CardDescription>
                {language === 'ru' ? 'Управление настройками приватности' : 'Manage your privacy settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{language === 'ru' ? 'Публичный профиль' : 'Public profile'}</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ru' ? 'Разрешить другим видеть ваш профиль' : 'Allow others to view your profile'}
                  </p>
                </div>
                <Switch
                  checked={publicProfile}
                  onCheckedChange={setPublicProfile}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={() => {
                toast({
                  title: language === 'ru' ? "Настройки сохранены" : "Settings saved",
                  description: language === 'ru' ? "Ваши настройки успешно обновлены" : "Your settings have been updated successfully",
                });
              }}
            >
              {language === 'ru' ? 'Сохранить изменения' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}