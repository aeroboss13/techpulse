import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Briefcase } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CreateJobDialogProps {
  children?: React.ReactNode;
}

export default function CreateJobDialog({ children }: CreateJobDialogProps) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [newTech, setNewTech] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    employmentType: '',
    experienceLevel: '',
    isRemote: false,
    contactEmail: '',
    externalLink: ''
  });

  const createJobMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/jobs', {
      method: 'POST',
      body: JSON.stringify({ ...data, technologies })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: language === 'ru' ? 'Успешно!' : 'Success!',
        description: language === 'ru' ? 'Вакансия создана' : 'Job created successfully'
      });
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Error',
        description: language === 'ru' ? 'Не удалось создать вакансию' : 'Failed to create job',
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      description: '',
      requirements: '',
      location: '',
      salary: '',
      employmentType: '',
      experienceLevel: '',
      isRemote: false,
      contactEmail: '',
      externalLink: ''
    });
    setTechnologies([]);
    setNewTech('');
  };

  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()]);
      setNewTech('');
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJobMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary/90">
            <Briefcase className="w-4 h-4 mr-2" />
            {language === 'ru' ? 'Создать вакансию' : 'Create Job'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'ru' ? 'Создать новую вакансию' : 'Create New Job'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">
                {language === 'ru' ? 'Название должности*' : 'Job Title*'}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="company">
                {language === 'ru' ? 'Компания*' : 'Company*'}
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">
              {language === 'ru' ? 'Описание*' : 'Description*'}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="requirements">
              {language === 'ru' ? 'Требования' : 'Requirements'}
            </Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              rows={3}
            />
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
              <Label htmlFor="salary">
                {language === 'ru' ? 'Зарплата' : 'Salary'}
              </Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                placeholder={language === 'ru' ? 'например, $5000-7000' : 'e.g., $5000-7000'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                {language === 'ru' ? 'Тип занятости' : 'Employment Type'}
              </Label>
              <Select value={formData.employmentType} onValueChange={(value) => setFormData(prev => ({ ...prev, employmentType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ru' ? 'Выберите тип' : 'Select type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">{language === 'ru' ? 'Полная занятость' : 'Full-time'}</SelectItem>
                  <SelectItem value="part-time">{language === 'ru' ? 'Частичная занятость' : 'Part-time'}</SelectItem>
                  <SelectItem value="contract">{language === 'ru' ? 'Контракт' : 'Contract'}</SelectItem>
                  <SelectItem value="freelance">{language === 'ru' ? 'Фриланс' : 'Freelance'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                {language === 'ru' ? 'Уровень опыта' : 'Experience Level'}
              </Label>
              <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ru' ? 'Выберите уровень' : 'Select level'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="middle">Middle</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>
              {language === 'ru' ? 'Технологии' : 'Technologies'}
            </Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                placeholder={language === 'ru' ? 'Добавить технологию' : 'Add technology'}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
              />
              <Button type="button" onClick={addTechnology} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                  {tech}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTechnology(tech)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">
                {language === 'ru' ? 'Email для связи' : 'Contact Email'}
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="externalLink">
                {language === 'ru' ? 'Внешняя ссылка' : 'External Link'}
              </Label>
              <Input
                id="externalLink"
                type="url"
                value={formData.externalLink}
                onChange={(e) => setFormData(prev => ({ ...prev, externalLink: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRemote"
              checked={formData.isRemote}
              onChange={(e) => setFormData(prev => ({ ...prev, isRemote: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isRemote">
              {language === 'ru' ? 'Удаленная работа' : 'Remote work'}
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {language === 'ru' ? 'Отмена' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={createJobMutation.isPending}>
              {createJobMutation.isPending 
                ? (language === 'ru' ? 'Создание...' : 'Creating...')
                : (language === 'ru' ? 'Создать вакансию' : 'Create Job')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}