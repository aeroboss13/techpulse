import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, FileText } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CreateResumeDialogProps {
  children?: React.ReactNode;
}

export default function CreateResumeDialog({ children }: CreateResumeDialogProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    experience: '',
    education: '',
    contactEmail: '',
    phoneNumber: '',
    location: '',
    portfolioUrl: '',
    isPublic: true,
    experienceYears: 0
  });

  const createResumeMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/resumes', { ...data, skills }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      toast({
        title: language === 'ru' ? 'Успешно!' : 'Success!',
        description: language === 'ru' ? 'Резюме создано' : 'Resume created successfully'
      });
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Error',
        description: language === 'ru' ? 'Не удалось создать резюме' : 'Failed to create resume',
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      experience: '',
      education: '',
      contactEmail: '',
      phoneNumber: '',
      location: '',
      portfolioUrl: '',
      isPublic: true,
      experienceYears: 0
    });
    setSkills([]);
    setNewSkill('');
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createResumeMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary/90">
            <FileText className="w-4 h-4 mr-2" />
            {language === 'ru' ? 'Создать резюме' : 'Create Resume'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'ru' ? 'Создать новое резюме' : 'Create New Resume'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">
              {language === 'ru' ? 'Заголовок резюме*' : 'Resume Title*'}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={language === 'ru' ? 'Frontend разработчик' : 'Frontend Developer'}
              required
            />
          </div>

          <div>
            <Label htmlFor="summary">
              {language === 'ru' ? 'Краткое описание*' : 'Summary*'}
            </Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              rows={3}
              placeholder={language === 'ru' ? 'Расскажите о себе...' : 'Tell about yourself...'}
              required
            />
          </div>

          <div>
            <Label htmlFor="experience">
              {language === 'ru' ? 'Опыт работы' : 'Work Experience'}
            </Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              rows={4}
              placeholder={language === 'ru' ? 'Опишите ваш опыт работы...' : 'Describe your work experience...'}
            />
          </div>

          <div>
            <Label htmlFor="education">
              {language === 'ru' ? 'Образование' : 'Education'}
            </Label>
            <Textarea
              id="education"
              value={formData.education}
              onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
              rows={3}
              placeholder={language === 'ru' ? 'Ваше образование...' : 'Your education...'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">
                {language === 'ru' ? 'Email*' : 'Email*'}
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">
                {language === 'ru' ? 'Телефон' : 'Phone'}
              </Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">
                {language === 'ru' ? 'Местоположение' : 'Location'}
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="experienceYears">
                {language === 'ru' ? 'Лет опыта' : 'Years of Experience'}
              </Label>
              <Input
                id="experienceYears"
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="portfolioUrl">
              {language === 'ru' ? 'Портфолио (URL)' : 'Portfolio URL'}
            </Label>
            <Input
              id="portfolioUrl"
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
              placeholder="https://myportfolio.com"
            />
          </div>

          <div>
            <Label>
              {language === 'ru' ? 'Навыки' : 'Skills'}
            </Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder={language === 'ru' ? 'Добавить навык' : 'Add skill'}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPublic">
              {language === 'ru' ? 'Сделать резюме публичным' : 'Make resume public'}
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {language === 'ru' ? 'Отмена' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={createResumeMutation.isPending}>
              {createResumeMutation.isPending 
                ? (language === 'ru' ? 'Создание...' : 'Creating...')
                : (language === 'ru' ? 'Создать резюме' : 'Create Resume')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}