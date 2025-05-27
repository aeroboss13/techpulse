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

const offerSchema = z.object({
  jobId: z.string().min(1, "Job is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface OfferJobDialogProps {
  resumeId: string;
  resumeTitle: string;
  resumeAuthorName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OfferJobDialog({
  resumeId,
  resumeTitle,
  resumeAuthorName,
  open,
  onOpenChange,
}: OfferJobDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      jobId: "",
      message: "",
    },
  });

  // Fetch user's jobs
  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/user/jobs"],
    enabled: open,
  });

  const offerMutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      return apiRequest(`/api/resumes/${resumeId}/offer`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t("offer_sent"),
        description: t("offer_sent_description"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/offers"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || t("failed_to_send_offer"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OfferFormData) => {
    offerMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("offer_job")}</DialogTitle>
          <DialogDescription>
            {t("offering_job_to")}: {resumeAuthorName} ({resumeTitle})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="jobId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("select_job")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("choose_job")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jobs.map((job: any) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title} - {job.company}
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
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("offer_message")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("offer_message_placeholder")}
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
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={offerMutation.isPending || jobs.length === 0}
              >
                {offerMutation.isPending ? t("sending") : t("send_offer")}
              </Button>
            </div>
          </form>
        </Form>

        {jobs.length === 0 && (
          <div className="text-center text-muted-foreground">
            <p>{t("no_jobs_available")}</p>
            <p className="text-sm">{t("create_job_first")}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}