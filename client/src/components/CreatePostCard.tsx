import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Code, Image, BarChart, Bot, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreatePostCard() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const createPostMutation = useMutation({
    mutationFn: (postData: any) => {
      return apiRequest("POST", "/api/posts", postData);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setContent("");
      setCodeSnippet("");
      toast({
        title: "Success!",
        description: "Your post has been published.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !codeSnippet.trim()) {
      toast({
        title: "Cannot create empty post",
        description: "Please add some text or code to your post.",
        variant: "destructive",
      });
      return;
    }
    
    const postData = {
      content,
      codeSnippet: codeSnippet,
      language: codeSnippet ? language : null,
      tags: extractHashtags(content),
    };
    
    createPostMutation.mutate(postData);
  };
  
  const extractHashtags = (text: string) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    if (!matches) return [];
    return matches.map(tag => tag.slice(1));
  };
  
  const handleCodeSubmit = () => {
    setIsCodeDialogOpen(false);
  };
  
  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real implementation, upload image to server and get URL
    toast({
      title: "Image upload",
      description: "Image uploads are not implemented in this demo",
    });
  };
  
  const askAiForSuggestion = async () => {
    if (!content.trim()) {
      toast({
        title: "Please add some text",
        description: "AI needs some context to provide suggestions.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAiDialogOpen(true);
    setIsAiLoading(true);
    
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content }),
      });
      
      if (!response.ok) throw new Error("Failed to get AI suggestion");
      
      const data = await response.json();
      setAiSuggestion(data.suggestion);
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Could not get suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const applyAiSuggestion = () => {
    setContent(aiSuggestion);
    setIsAiDialogOpen(false);
  };
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
            <AvatarFallback>{user?.firstName?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              className="w-full border-0 focus:ring-0 text-gray-700 dark:text-gray-300 placeholder-gray-400 bg-transparent resize-none"
              rows={2}
              placeholder="What's happening in your dev world?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {codeSnippet && (
              <div className="mt-3 bg-gray-100 dark:bg-slate-800 rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{language}</span>
                  <button 
                    type="button"
                    className="text-xs text-gray-500 hover:text-red-500"
                    onClick={() => setCodeSnippet("")}
                  >
                    Remove
                  </button>
                </div>
                <pre className="text-xs">
                  <code>{codeSnippet.length > 100 ? codeSnippet.substring(0, 100) + "..." : codeSnippet}</code>
                </pre>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-3">
              <div className="flex space-x-4">
                <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full text-primary"
                      title="Attach code snippet"
                    >
                      <Code className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Code Snippet</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="csharp">C#</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                          <SelectItem value="go">Go</SelectItem>
                          <SelectItem value="rust">Rust</SelectItem>
                          <SelectItem value="ruby">Ruby</SelectItem>
                          <SelectItem value="php">PHP</SelectItem>
                          <SelectItem value="swift">Swift</SelectItem>
                          <SelectItem value="kotlin">Kotlin</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="css">CSS</SelectItem>
                          <SelectItem value="sql">SQL</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        className="font-mono"
                        rows={10}
                        placeholder="Paste your code here..."
                        value={codeSnippet}
                        onChange={(e) => setCodeSnippet(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button type="button" onClick={handleCodeSubmit}>Add to Post</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full text-primary"
                  title="Attach image"
                  onClick={handleImageUpload}
                >
                  <Image className="h-5 w-5" />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
                
                {/* Удалена кнопка для опросов, так как она не нужна */}
                
                <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full text-primary"
                      title="Ask AI for help"
                      onClick={askAiForSuggestion}
                    >
                      <Bot className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>AI Suggestion</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {isAiLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                          <p className="text-sm text-gray-500">AI is thinking...</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500">
                            Here's an improved version of your post suggested by our AI assistant:
                          </p>
                          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-md">
                            {aiSuggestion}
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => setIsAiDialogOpen(false)}
                            >
                              Ignore
                            </Button>
                            <Button type="button" onClick={applyAiSuggestion}>
                              Use Suggestion
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Button 
                type="submit" 
                disabled={createPostMutation.isPending}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full font-medium"
              >
                {createPostMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
