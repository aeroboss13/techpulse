import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, User } from "lucide-react";
import Jobs from "./Jobs";
import Resumes from "./Resumes";

export default function Work() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Briefcase className="w-6 h-6" />
              Работа
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="jobs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Вакансии
                </TabsTrigger>
                <TabsTrigger value="resumes" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Резюме
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="jobs" className="mt-6">
                <Jobs />
              </TabsContent>
              
              <TabsContent value="resumes" className="mt-6">
                <Resumes />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}