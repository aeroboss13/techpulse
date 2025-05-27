import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/LanguageProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, User, Briefcase, Plus, Search, Link as LinkIcon, Github, Linkedin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CreateResumeDialog from "@/components/CreateResumeDialog";

interface Resume {
  id: string;
  title: string;
  summary: string;
  experience: string;
  skills: string[];
  education: string;
  location: string;
  expectedSalary: string;
  preferredEmploymentType: string;
  isRemotePreferred: boolean;
  portfolioLink: string;
  githubLink: string;
  linkedinLink: string;
  isVisible: boolean;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  };
}

export default function Resumes() {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["/api/resumes"],
    queryFn: async () => {
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error('Failed to fetch resumes');
      return res.json();
    }
  });

  const filteredResumes = resumes.filter((resume: Resume) =>
    searchTerm === "" || 
    resume.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
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
            {language === 'ru' ? 'Резюме' : 'Resumes'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'ru' 
              ? 'Найдите талантливых разработчиков для вашей команды' 
              : 'Find talented developers for your team'}
          </p>
        </div>
        
        <CreateResumeDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ru' ? 'Создать резюме' : 'Create Resume'}
          </Button>
        </CreateResumeDialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={language === 'ru' ? 'Поиск по резюме...' : 'Search resumes...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Resumes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResumes.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === 'ru' ? 'Резюме не найдены' : 'No resumes found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'ru' 
                    ? 'Попробуйте изменить параметры поиска или создайте свое резюме'
                    : 'Try adjusting your search criteria or create your resume'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredResumes.map((resume: Resume) => (
            <Card key={resume.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={resume.user?.profileImageUrl} />
                      <AvatarFallback>
                        {resume.user?.firstName?.[0] || resume.user?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{resume.title}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {resume.user?.firstName} {resume.user?.lastName} (@{resume.user?.username})
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {resume.isRemotePreferred && (
                      <Badge variant="secondary">{language === 'ru' ? 'Удаленно' : 'Remote'}</Badge>
                    )}
                    <Badge variant="outline">{resume.preferredEmploymentType}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                    {resume.summary}
                  </p>
                  
                  {resume.skills && resume.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.slice(0, 6).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {resume.skills.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{resume.skills.length - 6} {language === 'ru' ? 'еще' : 'more'}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      {resume.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {resume.location}
                        </div>
                      )}
                      {resume.expectedSalary && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {resume.expectedSalary}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {resume.portfolioLink && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={resume.portfolioLink} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {resume.githubLink && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={resume.githubLink} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {resume.linkedinLink && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={resume.linkedinLink} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {language === 'ru' ? 'Обновлено' : 'Updated'} {new Date(resume.createdAt).toLocaleDateString()}
                    </div>
                    {isAuthenticated && (
                      <Button size="sm">
                        {language === 'ru' ? 'Связаться' : 'Contact'}
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