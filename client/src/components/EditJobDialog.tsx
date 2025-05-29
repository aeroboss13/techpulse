import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/components/LanguageProvider";

interface EditJobDialogProps {
  job: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditJobDialog({ job, open, onOpenChange }: EditJobDialogProps) {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: job?.title || '',
    company: job?.company || '',
    description: job?.description || '',
    requirements: job?.requirements || '',
    benefits: job?.benefits || '',
    salary: job?.salary || '',
    location: job?.location || '',
    type: job?.type || 'full-time',
    level: job?.level || 'middle',
    remote: job?.remote || false,
    contactEmail: job?.contactEmail || ''
  });

  const updateJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/search'] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating job:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateJobMutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'ru' ? 'Редактировать вакансию' : 'Edit Job'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ru' ? 'Название позиции' : 'Job Title'}
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ru' ? 'Компания' : 'Company'}
              </label>
              <Input
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'ru' ? 'Описание' : 'Description'}
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'ru' ? 'Требования' : 'Requirements'}
            </label>
            <Textarea
              value={formData.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'ru' ? 'Условия и льготы' : 'Benefits'}
            </label>
            <Textarea
              value={formData.benefits}
              onChange={(e) => handleChange('benefits', e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ru' ? 'Зарплата' : 'Salary'}
              </label>
              <Input
                value={formData.salary}
                onChange={(e) => handleChange('salary', e.target.value)}
                placeholder={language === 'ru' ? 'например, 100000-150000 руб' : 'e.g., $50,000-70,000'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ru' ? 'Местоположение' : 'Location'}
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder={language === 'ru' ? 'Москва' : 'New York'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ru' ? 'Тип занятости' : 'Job Type'}
              </label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">
                    {language === 'ru' ? 'Полная занятость' : 'Full-time'}
                  </SelectItem>
                  <SelectItem value="part-time">
                    {language === 'ru' ? 'Частичная занятость' : 'Part-time'}
                  </SelectItem>
                  <SelectItem value="contract">
                    {language === 'ru' ? 'Контракт' : 'Contract'}
                  </SelectItem>
                  <SelectItem value="freelance">
                    {language === 'ru' ? 'Фриланс' : 'Freelance'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ru' ? 'Уровень' : 'Level'}
              </label>
              <Select value={formData.level} onValueChange={(value) => handleChange('level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intern">
                    {language === 'ru' ? 'Стажер' : 'Intern'}
                  </SelectItem>
                  <SelectItem value="junior">
                    {language === 'ru' ? 'Junior' : 'Junior'}
                  </SelectItem>
                  <SelectItem value="middle">
                    {language === 'ru' ? 'Middle' : 'Middle'}
                  </SelectItem>
                  <SelectItem value="senior">
                    {language === 'ru' ? 'Senior' : 'Senior'}
                  </SelectItem>
                  <SelectItem value="lead">
                    {language === 'ru' ? 'Lead' : 'Lead'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'ru' ? 'Email для связи' : 'Contact Email'}
            </label>
            <Input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote"
              checked={formData.remote}
              onCheckedChange={(checked) => handleChange('remote', checked)}
            />
            <label
              htmlFor="remote"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {language === 'ru' ? 'Удаленная работа' : 'Remote work'}
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updateJobMutation.isPending}
            >
              {language === 'ru' ? 'Отмена' : 'Cancel'}
            </Button>
            <Button 
              type="submit" 
              disabled={updateJobMutation.isPending}
            >
              {updateJobMutation.isPending 
                ? (language === 'ru' ? 'Сохранение...' : 'Saving...') 
                : (language === 'ru' ? 'Сохранить' : 'Save')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}