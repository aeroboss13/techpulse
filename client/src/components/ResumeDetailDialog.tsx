import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Phone, Calendar, Briefcase, GraduationCap, Globe, Send } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import OfferJobDialog from "./OfferJobDialog";

interface ResumeDetailDialogProps {
  resume: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResumeDetailDialog({ resume, open, onOpenChange }: ResumeDetailDialogProps) {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [showOfferDialog, setShowOfferDialog] = useState(false);

  if (!resume) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{resume.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resume.user && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {resume.user.firstName?.[0] || resume.user.username?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {resume.user.firstName || resume.user.username}
                    {resume.user.lastName && ` ${resume.user.lastName}`}
                  </p>
                </div>
              </div>
            )}
            
            {resume.contactEmail && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{resume.contactEmail}</span>
              </div>
            )}
            
            {resume.telegramNick && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.568 8.16c-.169 1.58-.896 5.42-1.266 7.175-.157.742-.465 1-.756 1.025-.641.059-1.127-.424-1.748-.832-.97-.635-1.516-.969-2.456-1.551-.108-.067-.208-.135-.287-.202-.109-.09-.137-.202-.07-.31.056-.09.26-.31.43-.46.674-.598 1.82-1.293 2.493-1.85.301-.249.202-.394-.124-.143-.73.564-2.093 1.47-2.864 1.958-.438.277-.916.285-1.414.114-.543-.188-1.156-.394-1.703-.579-.941-.318-1.69-.486-1.624-1.024.033-.269.408-.536 1.123-.8l8.4-3.2c.8-.301 1.5-.2 1.96.12z"/>
                </svg>
                <a 
                  href={`https://t.me/${resume.telegramNick.replace('@', '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline cursor-pointer"
                >
                  {resume.telegramNick}
                </a>
              </div>
            )}
            
            {resume.location && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{resume.location}</span>
              </div>
            )}
            
            {resume.experienceYears > 0 && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Briefcase className="w-4 h-4" />
                <span>
                  {resume.experienceYears} {language === 'ru' ? 'лет опыта' : 'years experience'}
                </span>
              </div>
            )}
            
            {resume.portfolioUrl && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Globe className="w-4 h-4" />
                <a 
                  href={resume.portfolioUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {language === 'ru' ? 'Портфолио' : 'Portfolio'}
                </a>
              </div>
            )}
          </div>

          <Separator />

          {/* Summary */}
          {resume.summary && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>{language === 'ru' ? 'О себе' : 'About'}</span>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {resume.summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {resume.skills && resume.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {language === 'ru' ? 'Навыки' : 'Skills'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {resume.experience && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <span>{language === 'ru' ? 'Опыт работы' : 'Experience'}</span>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {resume.experience}
              </p>
            </div>
          )}

          {/* Education */}
          {resume.education && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <span>{language === 'ru' ? 'Образование' : 'Education'}</span>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {resume.education}
              </p>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              {t('created')}: {new Date(resume.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Offer Job Button */}
          {isAuthenticated && user?.id !== resume.userId && (
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={() => setShowOfferDialog(true)}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {t('offer_job')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Offer Job Dialog */}
      <OfferJobDialog
        resumeId={resume.id}
        resumeTitle={resume.title}
        resumeAuthorName={resume.contactEmail || t('anonymous')}
        open={showOfferDialog}
        onOpenChange={setShowOfferDialog}
      />
    </Dialog>
  );
}