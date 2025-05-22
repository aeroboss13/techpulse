import React from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();

  const handleLanguageChange = async (newLanguage: 'en' | 'ru') => {
    // Сохраняем выбор языка в localStorage
    localStorage.setItem('language', newLanguage);
    
    // Показываем уведомление
    toast({
      title: newLanguage === 'en' ? 'Language updated' : 'Язык обновлен',
      description: newLanguage === 'en' ? 'Your language preference has been saved' : 'Ваши настройки языка были сохранены',
    });
    
    // Принудительно перезагружаем страницу для обновления всех компонентов
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full flex items-center">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className={`flex items-center ${language === 'en' ? 'bg-primary/10' : ''}`}
          onClick={() => handleLanguageChange('en')}
        >
          <div className="mr-2 w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
            🇺🇸
          </div>
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={`flex items-center ${language === 'ru' ? 'bg-primary/10' : ''}`}
          onClick={() => handleLanguageChange('ru')}
        >
          <div className="mr-2 w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
            🇷🇺
          </div>
          <span>Русский</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}