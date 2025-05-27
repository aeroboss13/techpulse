import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/LanguageProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Building, Clock, DollarSign, Users, Plus, Search, Filter, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CreateJobDialog from "@/components/CreateJobDialog";
import JobDetailDialog from "@/components/JobDetailDialog";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
  employmentType: string;
  experienceLevel: string;
  technologies: string[];
  isRemote: boolean;
  contactEmail: string;
  externalLink: string;
  createdAt: string;
  poster?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  };
}

export default function Jobs() {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    experienceLevel: "",
    employmentType: "",
    isRemote: undefined as boolean | undefined,
    technologies: [] as string[]
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
    employmentType: "full-time",
    experienceLevel: "middle",
    technologies: [] as string[],
    isRemote: false,
    contactEmail: "",
    externalLink: ""
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["/api/jobs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      const url = Object.keys(filters).some(key => filters[key as keyof typeof filters] !== "" && filters[key as keyof typeof filters] !== undefined)
        ? `/api/jobs/search?${params.toString()}`
        : "/api/jobs";
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      return res.json();
    }
  });

  const createJobMutation = useMutation({
    mutationFn: (jobData: typeof newJob) => apiRequest("/api/jobs", "POST", jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setIsCreateDialogOpen(false);
      setNewJob({
        title: "",
        company: "",
        description: "",
        requirements: "",
        location: "",
        salary: "",
        employmentType: "full-time",
        experienceLevel: "middle",
        technologies: [],
        isRemote: false,
        contactEmail: "",
        externalLink: ""
      });
      toast({
        title: language === 'ru' ? "Вакансия создана" : "Job Created",
        description: language === 'ru' ? "Ваша вакансия успешно опубликована" : "Your job posting has been published successfully"
      });
    }
  });

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.company || !newJob.description) {
      toast({
        title: language === 'ru' ? "Ошибка" : "Error",
        description: language === 'ru' ? "Пожалуйста, заполните все обязательные поля" : "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    createJobMutation.mutate(newJob);
  };

  const addTechnology = (tech: string) => {
    if (tech && !newJob.technologies.includes(tech)) {
      setNewJob(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech]
      }));
    }
  };

  const removeTechnology = (tech: string) => {
    setNewJob(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const filteredJobs = jobs.filter((job: Job) =>
    searchTerm === "" || 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ru' ? 'Вакансии' : 'Jobs'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'ru' 
              ? 'Найдите работу своей мечты в IT сфере' 
              : 'Find your dream job in tech'}
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {language === 'ru' ? 'Создать вакансию' : 'Post Job'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {language === 'ru' ? 'Создать новую вакансию' : 'Create New Job Posting'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'ru' ? 'Название должности *' : 'Job Title *'}</Label>
                    <Input
                      value={newJob.title}
                      onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={language === 'ru' ? 'Frontend разработчик' : 'Frontend Developer'}
                    />
                  </div>
                  <div>
                    <Label>{language === 'ru' ? 'Компания *' : 'Company *'}</Label>
                    <Input
                      value={newJob.company}
                      onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
                      placeholder={language === 'ru' ? 'Название компании' : 'Company name'}
                    />
                  </div>
                </div>

                <div>
                  <Label>{language === 'ru' ? 'Описание *' : 'Description *'}</Label>
                  <Textarea
                    value={newJob.description}
                    onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={language === 'ru' ? 'Описание вакансии...' : 'Job description...'}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>{language === 'ru' ? 'Требования' : 'Requirements'}</Label>
                  <Textarea
                    value={newJob.requirements}
                    onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
                    placeholder={language === 'ru' ? 'Требования к кандидату...' : 'Requirements for the candidate...'}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'ru' ? 'Локация' : 'Location'}</Label>
                    <Input
                      value={newJob.location}
                      onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                      placeholder={language === 'ru' ? 'Москва, Россия' : 'New York, USA'}
                    />
                  </div>
                  <div>
                    <Label>{language === 'ru' ? 'Зарплата' : 'Salary'}</Label>
                    <Input
                      value={newJob.salary}
                      onChange={(e) => setNewJob(prev => ({ ...prev, salary: e.target.value }))}
                      placeholder={language === 'ru' ? '100,000 - 150,000 руб.' : '$80,000 - $120,000'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'ru' ? 'Тип занятости' : 'Employment Type'}</Label>
                    <Select value={newJob.employmentType} onValueChange={(value) => setNewJob(prev => ({ ...prev, employmentType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label>{language === 'ru' ? 'Уровень опыта' : 'Experience Level'}</Label>
                    <Select value={newJob.experienceLevel} onValueChange={(value) => setNewJob(prev => ({ ...prev, experienceLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">{language === 'ru' ? 'Junior' : 'Junior'}</SelectItem>
                        <SelectItem value="middle">{language === 'ru' ? 'Middle' : 'Middle'}</SelectItem>
                        <SelectItem value="senior">{language === 'ru' ? 'Senior' : 'Senior'}</SelectItem>
                        <SelectItem value="lead">{language === 'ru' ? 'Lead' : 'Lead'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={newJob.isRemote}
                    onCheckedChange={(checked) => setNewJob(prev => ({ ...prev, isRemote: checked as boolean }))}
                  />
                  <Label htmlFor="remote">{language === 'ru' ? 'Удаленная работа' : 'Remote work'}</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'ru' ? 'Email для связи' : 'Contact Email'}</Label>
                    <Input
                      type="email"
                      value={newJob.contactEmail}
                      onChange={(e) => setNewJob(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div>
                    <Label>{language === 'ru' ? 'Внешняя ссылка' : 'External Link'}</Label>
                    <Input
                      value={newJob.externalLink}
                      onChange={(e) => setNewJob(prev => ({ ...prev, externalLink: e.target.value }))}
                      placeholder="https://company.com/careers"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {language === 'ru' ? 'Отмена' : 'Cancel'}
                  </Button>
                  <Button onClick={handleCreateJob} disabled={createJobMutation.isPending}>
                    {createJobMutation.isPending 
                      ? (language === 'ru' ? 'Создание...' : 'Creating...')
                      : (language === 'ru' ? 'Создать' : 'Create')
                    }
                  </Button>
                </div>
              </div>
            </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={language === 'ru' ? 'Поиск вакансий...' : 'Search jobs...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.experienceLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, experienceLevel: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={language === 'ru' ? 'Уровень' : 'Level'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ru' ? 'Все' : 'All'}</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="middle">Middle</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.employmentType} onValueChange={(value) => setFilters(prev => ({ ...prev, employmentType: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={language === 'ru' ? 'Тип' : 'Type'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ru' ? 'Все' : 'All'}</SelectItem>
              <SelectItem value="full-time">{language === 'ru' ? 'Полная' : 'Full-time'}</SelectItem>
              <SelectItem value="part-time">{language === 'ru' ? 'Частичная' : 'Part-time'}</SelectItem>
              <SelectItem value="contract">{language === 'ru' ? 'Контракт' : 'Contract'}</SelectItem>
              <SelectItem value="freelance">{language === 'ru' ? 'Фриланс' : 'Freelance'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'ru' ? 'Вакансии не найдены' : 'No jobs found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'ru' 
                  ? 'Попробуйте изменить параметры поиска или создайте новую вакансию'
                  : 'Try adjusting your search criteria or post a new job'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job: Job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                      </div>
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                      )}
                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{job.experienceLevel}</Badge>
                    <Badge variant="outline">{job.employmentType}</Badge>
                    {job.isRemote && (
                      <Badge variant="secondary">{language === 'ru' ? 'Удаленно' : 'Remote'}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                  {job.description}
                </p>
                
                {job.technologies && job.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'ru' ? 'Опубликовано' : 'Posted'} {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    {job.externalLink && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={job.externalLink} target="_blank" rel="noopener noreferrer">
                          {language === 'ru' ? 'Подробнее' : 'Learn More'}
                        </a>
                      </Button>
                    )}
                    {isAuthenticated && (
                      <Button size="sm">
                        {language === 'ru' ? 'Откликнуться' : 'Apply'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}