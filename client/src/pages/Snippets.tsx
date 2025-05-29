import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/MainLayout";
import CodeSnippet from "@/components/CodeSnippet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Trash2, Edit, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  createdAt: string;
  isPublic: boolean;
}

export default function Snippets() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    document.title = "DevStream - My Snippets";
  }, []);
  
  const { data: mySnippets, isLoading: isMySnippetsLoading } = useQuery({
    queryKey: ["/api/snippets/my"],
    queryFn: async () => {
      const res = await fetch("/api/snippets/my");
      if (!res.ok) throw new Error("Failed to fetch snippets");
      return res.json();
    },
  });
  
  const { data: publicSnippets, isLoading: isPublicSnippetsLoading } = useQuery({
    queryKey: ["/api/snippets/public"],
    queryFn: async () => {
      const res = await fetch("/api/snippets/public");
      if (!res.ok) throw new Error("Failed to fetch public snippets");
      return res.json();
    },
  });
  
  const createSnippetMutation = useMutation({
    mutationFn: (snippetData: any) => {
      return apiRequest("POST", "/api/snippets", snippetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snippets/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/snippets/public"] });
      resetForm();
      setIsCreateDialogOpen(false);
      toast({
        title: "Success!",
        description: "Your snippet has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save snippet",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const updateSnippetMutation = useMutation({
    mutationFn: (snippetData: any) => {
      return apiRequest("PUT", `/api/snippets/${editingSnippet?.id}`, snippetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snippets/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/snippets/public"] });
      resetForm();
      setIsCreateDialogOpen(false);
      toast({
        title: "Success!",
        description: "Your snippet has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update snippet",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const deleteSnippetMutation = useMutation({
    mutationFn: (snippetId: string) => {
      return apiRequest("DELETE", `/api/snippets/${snippetId}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snippets/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/snippets/public"] });
      toast({
        title: "Success!",
        description: "Your snippet has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete snippet",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !code.trim()) {
      toast({
        title: "Missing required fields",
        description: "Title and code are required.",
        variant: "destructive",
      });
      return;
    }
    
    const snippetData = {
      title,
      description,
      code,
      language,
      tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
      isPublic,
    };
    
    if (editingSnippet) {
      updateSnippetMutation.mutate(snippetData);
    } else {
      createSnippetMutation.mutate(snippetData);
    }
  };
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCode("");
    setLanguage("javascript");
    setTags("");
    setIsPublic(true);
    setEditingSnippet(null);
  };
  
  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setTitle(snippet.title);
    setDescription(snippet.description);
    setCode(snippet.code);
    setLanguage(snippet.language);
    setTags(snippet.tags.join(", "));
    setIsPublic(snippet.isPublic);
    setIsCreateDialogOpen(true);
  };
  
  const handleDelete = (snippetId: string) => {
    if (window.confirm("Are you sure you want to delete this snippet?")) {
      deleteSnippetMutation.mutate(snippetId);
    }
  };
  
  const handleShare = async (snippet: Snippet) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: snippet.title,
          text: snippet.description,
          url: window.location.origin + `/snippet/${snippet.id}`,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      const url = `${window.location.origin}/snippet/${snippet.id}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied to clipboard",
        duration: 2000,
      });
    }
  };
  
  const filteredMySnippets = mySnippets?.filter((snippet: Snippet) => 
    snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const renderSnippetSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-32 w-full rounded-md mb-3" />
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderSnippetCard = (snippet: Snippet) => (
    <Card key={snippet.id}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{snippet.title}</span>
          {snippet.isPublic && (
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Public
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {snippet.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {snippet.description}
          </p>
        )}
        
        <div className="mb-4">
          <CodeSnippet code={snippet.code} language={snippet.language} />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-1">
            {snippet.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              title="Share"
              onClick={() => handleShare(snippet)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              title="Edit"
              onClick={() => handleEdit(snippet)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              title="Delete"
              onClick={() => handleDelete(snippet.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <MainLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <Input
            type="text"
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary w-full"
            placeholder={t('snippets.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Snippet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSnippet ? "Edit Snippet" : "Create New Snippet"}
              </DialogTitle>
              <DialogDescription>
                Save and organize your code snippets for easy access later.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your snippet"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Add a brief description (optional)"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="language" className="text-sm font-medium">
                    Language
                  </label>
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
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="code" className="text-sm font-medium">
                    Code
                  </label>
                  <Textarea
                    id="code"
                    placeholder="Paste your code here"
                    className="font-mono"
                    rows={10}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="tags" className="text-sm font-medium">
                    Tags
                  </label>
                  <Input
                    id="tags"
                    placeholder="Enter tags separated by commas"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">
                    Make this snippet public
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSnippet ? "Update" : "Create"} Snippet
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="my-snippets">
        <TabsList className="w-full">
          <TabsTrigger value="my-snippets" className="flex-1">My Snippets</TabsTrigger>
          <TabsTrigger value="public-snippets" className="flex-1">Public Snippets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-snippets" className="space-y-6 mt-6">
          {isMySnippetsLoading ? (
            <>
              {renderSnippetSkeleton()}
              {renderSnippetSkeleton()}
            </>
          ) : mySnippets?.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
              <h3 className="text-xl font-medium mb-2">No snippets yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create your first code snippet to save it for later use!
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Snippet
              </Button>
            </div>
          ) : filteredMySnippets?.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
              <h3 className="text-xl font-medium mb-2">No matching snippets</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try different search terms
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredMySnippets?.map((snippet: Snippet) => renderSnippetCard(snippet))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="public-snippets" className="space-y-6 mt-6">
          {isPublicSnippetsLoading ? (
            <>
              {renderSnippetSkeleton()}
              {renderSnippetSkeleton()}
            </>
          ) : publicSnippets?.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
              <h3 className="text-xl font-medium mb-2">No public snippets available</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Be the first to share a public snippet with the community!
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {publicSnippets?.map((snippet: Snippet) => (
                <Card key={snippet.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{snippet.title}</span>
                      <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        Public
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {snippet.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {snippet.description}
                      </p>
                    )}
                    
                    <div className="mb-4">
                      <CodeSnippet code={snippet.code} language={snippet.language} />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {snippet.tags.map(tag => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShare(snippet)}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
