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
import { MapPin, User, Briefcase, Plus, Search, Link as LinkIcon, Github, Linkedin, Eye, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import ResumeDetailDialog from "@/components/ResumeDetailDialog";
import { useToast } from "@/hooks/use-toast";
import CreateResumeDialog from "@/components/CreateResumeDialog";

interface Resume {
  id: string;
  title: string;
  summary: string;
  experience: string;
  skills: string[];
  education: string;
  contactEmail: string;
  telegramNick: string;
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
  const { isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteConfirmResume, setDeleteConfirmResume] = useState<Resume | null>(null);

  // Мутация для удаления резюме
  const deleteResumeMutation = useMutation({
    mutationFn: async (resumeId: string) => {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete resume');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      setDeleteConfirmResume(null);
      toast({
        title: language === 'ru' ? 'Резюме удалено' : 'Resume deleted',
        description: language === 'ru' ? 'Ваше резюме было успешно удалено' : 'Your resume has been successfully deleted'
      });
    },
    onError: (error) => {
      console.error('Error deleting resume:', error);
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Error',
        description: language === 'ru' ? 'Не удалось удалить резюме' : 'Failed to delete resume',
        variant: 'destructive'
      });
    }
  });
  
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-gray-600 dark:text-gray-400">
            Найдите талантливых разработчиков для вашей команды
          </p>
        </div>
        
        <CreateResumeDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Создать резюме
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="shrink-0">
                      <AvatarImage src={resume.user?.profileImageUrl} />
                      <AvatarFallback>
                        {resume.user?.firstName?.[0] || resume.user?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg truncate">{resume.title}</CardTitle>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {resume.user?.firstName} {resume.user?.lastName} (@{resume.user?.username})
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
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
                  
                  <div className="pt-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {language === 'ru' ? 'Обновлено' : 'Updated'} {new Date(resume.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedResume(resume);
                          setIsDetailDialogOpen(true);
                        }}
                        className="flex-shrink-0"
                      >
                        <Eye className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">{language === 'ru' ? 'Детали' : 'Details'}</span>
                      </Button>
                      
                      {/* Owner actions */}
                      {isAuthenticated && user?.id === resume.user?.id && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingResume(resume);
                              setIsEditDialogOpen(true);
                            }}
                            className="flex-shrink-0"
                          >
                            <Edit className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">{language === 'ru' ? 'Ред.' : 'Edit'}</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setDeleteConfirmResume(resume)}
                            disabled={deleteResumeMutation.isPending}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">{language === 'ru' ? 'Удалить' : 'Delete'}</span>
                          </Button>
                        </>
                      )}
                      
                      {isAuthenticated && resume.telegramNick && (
                        <Button 
                          size="sm" 
                          asChild
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <a 
                            href={`https://t.me/${resume.telegramNick.replace('@', '')}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.568 8.16c-.169 1.58-.896 5.42-1.266 7.175-.157.742-.465 1-.756 1.025-.641.059-1.127-.424-1.748-.832-.97-.635-1.516-.969-2.456-1.551-.108-.067-.208-.135-.287-.202-.109-.09-.137-.202-.07-.31.056-.09.26-.31.43-.46.674-.598 1.82-1.293 2.493-1.85.301-.249.202-.394-.124-.143-.73.564-2.093 1.47-2.864 1.958-.438.277-.916.285-1.414.114-.543-.188-1.156-.394-1.703-.579-.941-.318-1.69-.486-1.624-1.024.033-.269.408-.536 1.123-.8l8.4-3.2c.8-.301 1.5-.2 1.96.12z"/>
                            </svg>
                            {language === 'ru' ? 'Связаться' : 'Contact'}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resume Detail Dialog */}
      <ResumeDetailDialog
        resume={selectedResume}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />

      {/* Edit Resume Dialog */}
      {editingResume && (
        <CreateResumeDialog 
          editingResume={editingResume}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmResume} onOpenChange={() => setDeleteConfirmResume(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'ru' ? 'Подтвердите удаление' : 'Confirm Deletion'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              {language === 'ru' 
                ? 'Вы уверены, что хотите удалить это резюме? Это действие нельзя отменить.'
                : 'Are you sure you want to delete this resume? This action cannot be undone.'
              }
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirmResume(null)}
                disabled={deleteResumeMutation.isPending}
              >
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteConfirmResume && deleteResumeMutation.mutate(deleteConfirmResume.id)}
                disabled={deleteResumeMutation.isPending}
              >
                {deleteResumeMutation.isPending 
                  ? (language === 'ru' ? 'Удаление...' : 'Deleting...') 
                  : (language === 'ru' ? 'Удалить' : 'Delete')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}