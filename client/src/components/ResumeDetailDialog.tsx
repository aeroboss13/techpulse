import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Phone, Calendar, Briefcase, GraduationCap, Globe } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface ResumeDetailDialogProps {
  resume: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResumeDetailDialog({ resume, open, onOpenChange }: ResumeDetailDialogProps) {
  const { language } = useLanguage();

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
            
            {resume.phoneNumber && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{resume.phoneNumber}</span>
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
              {language === 'ru' ? 'Создано' : 'Created'}: {new Date(resume.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}