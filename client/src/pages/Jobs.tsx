import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/LanguageProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Building, Clock, DollarSign, Users, Plus, Search, Eye } from "lucide-react";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "all",
    experienceLevel: "all",
    employmentType: "all",
    isRemote: "all"
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['/api/jobs/search', { searchTerm, ...filters }],
    enabled: isAuthenticated,
  });

  const filteredJobs = jobs.filter((job: Job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = filters.location === "all" || 
                           job.location?.toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesExperience = filters.experienceLevel === "all" || 
                             job.experienceLevel === filters.experienceLevel;
    
    const matchesEmployment = filters.employmentType === "all" || 
                             job.employmentType === filters.employmentType;
    
    const matchesRemote = filters.isRemote === "all" || 
                         (filters.isRemote === "remote" && job.isRemote) ||
                         (filters.isRemote === "office" && !job.isRemote);

    return matchesSearch && matchesLocation && matchesExperience && matchesEmployment && matchesRemote;
  });

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
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
        
        <CreateJobDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ru' ? 'Создать вакансию' : 'Post Job'}
          </Button>
        </CreateJobDialog>
      </div>

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
          <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={language === 'ru' ? 'Локация' : 'Location'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ru' ? 'Все' : 'All'}</SelectItem>
              <SelectItem value="москва">{language === 'ru' ? 'Москва' : 'Moscow'}</SelectItem>
              <SelectItem value="санкт-петербург">{language === 'ru' ? 'СПб' : 'St. Petersburg'}</SelectItem>
              <SelectItem value="remote">{language === 'ru' ? 'Удаленно' : 'Remote'}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.experienceLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, experienceLevel: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={language === 'ru' ? 'Опыт' : 'Experience'} />
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
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleJobClick(job)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {language === 'ru' ? 'Подробнее' : 'Details'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                  {job.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.isRemote && (
                    <Badge variant="secondary">
                      {language === 'ru' ? 'Удаленно' : 'Remote'}
                    </Badge>
                  )}
                  {job.experienceLevel && (
                    <Badge variant="outline">
                      {job.experienceLevel}
                    </Badge>
                  )}
                  {job.employmentType && (
                    <Badge variant="outline">
                      {job.employmentType === 'full-time' ? (language === 'ru' ? 'Полная занятость' : 'Full-time') :
                       job.employmentType === 'part-time' ? (language === 'ru' ? 'Частичная занятость' : 'Part-time') :
                       job.employmentType === 'contract' ? (language === 'ru' ? 'Контракт' : 'Contract') :
                       job.employmentType === 'freelance' ? (language === 'ru' ? 'Фриланс' : 'Freelance') :
                       job.employmentType}
                    </Badge>
                  )}
                  {job.technologies?.slice(0, 3).map((tech, index) => (
                    <Badge key={index} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                  {job.technologies?.length > 3 && (
                    <Badge variant="secondary">
                      +{job.technologies.length - 3} {language === 'ru' ? 'еще' : 'more'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedJob && (
        <JobDetailDialog
          job={selectedJob}
          open={isJobDetailOpen}
          onOpenChange={setIsJobDetailOpen}
        />
      )}
    </div>
  );
}