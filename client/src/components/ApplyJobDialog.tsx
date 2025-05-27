import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/LanguageProvider";
import { apiRequest } from "@/lib/queryClient";

const applicationSchema = z.object({
  resumeId: z.string().min(1, "Resume is required"),
  coverLetter: z.string().min(10, "Cover letter must be at least 10 characters"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplyJobDialogProps {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApplyJobDialog({
  jobId,
  jobTitle,
  open,
  onOpenChange,
}: ApplyJobDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      resumeId: "",
      coverLetter: "",
    },
  });

  // Fetch user's resumes
  const { data: resumes = [] } = useQuery({
    queryKey: ["/api/user/resumes"],
    enabled: open,
  });

  const applyMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      return apiRequest(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t("application_sent"),
        description: t("application_sent_description"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/applications"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || t("failed_to_apply"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    applyMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Откликнуться на вакансию</DialogTitle>
          <DialogDescription>
            Отклик на вакансию: {jobTitle}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="resumeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Выберите резюме</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите резюме" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resumes.map((resume: any) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сопроводительное письмо</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Расскажите, почему вы подходите для этой позиции..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={applyMutation.isPending || resumes.length === 0}
              >
                {applyMutation.isPending ? "Отправка..." : "Отправить отклик"}
              </Button>
            </div>
          </form>
        </Form>

        {resumes.length === 0 && (
          <div className="text-center text-muted-foreground">
            <p>У вас нет доступных резюме</p>
            <p className="text-sm">Сначала создайте резюме, чтобы откликнуться на вакансию</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}