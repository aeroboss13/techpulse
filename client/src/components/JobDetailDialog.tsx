import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Building, Calendar, DollarSign, Clock, Users, Eye, Send } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import ApplyJobDialog from "./ApplyJobDialog";

interface JobDetailDialogProps {
  job: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JobDetailDialog({ job, open, onOpenChange }: JobDetailDialogProps) {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  // Check if user has already applied to this job
  const { data: applicationStatus } = useQuery({
    queryKey: [`/api/applications/check/${job?.id}`],
    enabled: open && isAuthenticated && !!job?.id,
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

          {/* Apply Button */}
          {isAuthenticated && user?.id !== job.postedBy && (
            <div className="flex justify-end pt-4 border-t">
              {applicationStatus?.hasApplied ? (
                <Button disabled variant="outline">
                  {t('already_applied')}
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowApplyDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {t('apply_now')}
                </Button>
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
    </Dialog>
  );
}