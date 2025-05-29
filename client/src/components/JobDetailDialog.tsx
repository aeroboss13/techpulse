import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Building, Calendar, DollarSign, Clock, Users, Eye, Send, BarChart3, Edit, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import ApplyJobDialog from "./ApplyJobDialog";
import EditJobDialog from "./EditJobDialog";

interface JobDetailDialogProps {
  job: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JobDetailDialog({ job, open, onOpenChange }: JobDetailDialogProps) {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();

  // Мутация для удаления вакансии
  const deleteJobMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/search'] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error deleting job:', error);
    }
  });

  const handleDeleteJob = () => {
    deleteJobMutation.mutate();
    setShowDeleteConfirm(false);
  };

  // Check if user has already applied to this job
  const { data: applicationStatus } = useQuery({
    queryKey: [`/api/applications/check/${job?.id}`],
    enabled: open && isAuthenticated && !!job?.id && user?.id !== job?.postedBy,
  });

  // Get analytics data if user is the job creator
  const { data: analytics } = useQuery({
    queryKey: [`/api/jobs/${job?.id}/analytics`],
    enabled: open && isAuthenticated && !!job?.id && user?.id === job?.postedBy,
  });

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Building className="w-5 h-5" />
              <span className="font-medium">{job.company}</span>
            </div>
            
            {job.location && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
            )}
            
            {job.salary && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <DollarSign className="w-4 h-4" />
                <span>{job.salary}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <Badge variant="outline">{job.type}</Badge>
            </div>
            
            {job.experienceLevel && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{job.experienceLevel}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Job Type and Remote */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{job.type}</Badge>
            {job.isRemote && (
              <Badge variant="outline">{language === 'ru' ? 'Удаленная работа' : 'Remote'}</Badge>
            )}
            {job.experienceLevel && (
              <Badge variant="outline">{job.experienceLevel}</Badge>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t('description')}
              </h3>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t('requirements')}
              </h3>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </div>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {language === 'ru' ? 'Требуемые навыки' : 'Required Skills'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {language === 'ru' ? 'Преимущества' : 'Benefits'}
              </h3>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {job.benefits}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {job.contactEmail && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {language === 'ru' ? 'Контакты' : 'Contact'}
              </h3>
              <div className="text-gray-700 dark:text-gray-300">
                <a 
                  href={`mailto:${job.contactEmail}`}
                  className="text-primary hover:underline"
                >
                  {job.contactEmail}
                </a>
              </div>
            </div>
          )}

          {/* Posted Date */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              {t('posted')}: {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Apply Button or Owner Actions */}
          {isAuthenticated && (
            <div className="flex flex-col sm:flex-row sm:justify-end pt-4 border-t gap-2">
              {user?.id === job.postedBy ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="flex items-center justify-center gap-2"
                    variant="outline"
                    size="sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {showAnalytics ? (language === 'ru' ? 'Скрыть аналитику' : 'Hide Analytics') : (language === 'ru' ? 'Аналитика' : 'Analytics')}
                    </span>
                    <span className="sm:hidden">
                      {language === 'ru' ? 'Аналитика' : 'Analytics'}
                    </span>
                  </Button>
                  <Button 
                    onClick={() => setShowEditDialog(true)}
                    className="flex items-center justify-center gap-2"
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                    {language === 'ru' ? 'Редактировать' : 'Edit'}
                  </Button>
                  <Button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center justify-center gap-2"
                    variant="outline"
                    size="sm"
                    disabled={deleteJobMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    {language === 'ru' ? 'Удалить' : 'Delete'}
                  </Button>
                </div>
              ) : applicationStatus?.hasApplied ? (
                <Button disabled variant="outline">
                  Уже откликнулись
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowApplyDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Откликнуться
                </Button>
              )}
            </div>
          )}

          {/* Analytics Section */}
          {showAnalytics && analytics && user?.id === job.postedBy && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Аналитика по вакансии
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.totalApplications}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Всего откликов
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {analytics.pendingApplications}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    В ожидании
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analytics.acceptedApplications}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Принято
                  </div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {analytics.rejectedApplications}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Отклонено
                  </div>
                </div>
              </div>

              {analytics.applications && analytics.applications.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Список откликов:</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {analytics.applications.map((app: any) => (
                      <div key={app.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{app.applicantName}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Резюме: {app.resumeTitle}
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            app.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {app.status === 'pending' ? 'В ожидании' :
                             app.status === 'accepted' ? 'Принято' : 'Отклонено'}
                          </div>
                        </div>
                        {app.coverLetter && (
                          <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            <strong>Сопроводительное письмо:</strong> {app.coverLetter}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Подано: {new Date(app.appliedAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>

      {/* Apply Job Dialog */}
      <ApplyJobDialog
        jobId={job.id}
        jobTitle={job.title}
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
      />

      {/* Edit Job Dialog */}
      <EditJobDialog
        job={job}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'ru' ? 'Подтвердите удаление' : 'Confirm Deletion'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              {language === 'ru' 
                ? 'Вы уверены, что хотите удалить эту вакансию? Это действие нельзя отменить.'
                : 'Are you sure you want to delete this job? This action cannot be undone.'
              }
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteJobMutation.isPending}
              >
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteJob}
                disabled={deleteJobMutation.isPending}
              >
                {deleteJobMutation.isPending 
                  ? (language === 'ru' ? 'Удаление...' : 'Deleting...') 
                  : (language === 'ru' ? 'Удалить' : 'Delete')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}