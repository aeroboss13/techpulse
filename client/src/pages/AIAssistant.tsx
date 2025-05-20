import { useState, useRef, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Send, Bot, Cpu, Code, Sparkles, FileCode, BookOpen } from 'lucide-react';
import CodeSnippet from '@/components/CodeSnippet';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  codeSnippet?: string;
  language?: string;
  timestamp: Date;
}

const EXAMPLE_PROMPTS = [
  {
    title: 'Debug My Code',
    description: 'Help me find issues in my code',
    icon: <FileCode className="h-5 w-5" />,
    prompt: "I keep getting an 'undefined is not a function' error in this code. Can you help debug it?",
  },
  {
    title: 'Explain a Concept',
    description: 'Get explanations for technical topics',
    icon: <BookOpen className="h-5 w-5" />,
    prompt: "Explain React hooks and their advantages over class components",
  },
  {
    title: 'Generate Code',
    description: 'Get code for a specific task',
    icon: <Code className="h-5 w-5" />,
    prompt: "Write a function that takes an array of numbers and returns the average",
  },
  {
    title: 'Optimize My Solution',
    description: 'Make your code more efficient',
    icon: <Sparkles className="h-5 w-5" />,
    prompt: "Can you optimize this sorting function for better performance?",
  },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI coding assistant. How can I help you today? You can ask me to explain concepts, debug your code, generate new code, or optimize your solutions.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "DevStream - AI Assistant";
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // In a real implementation, we would call the OpenAI API here
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // Check if there's code in the response
      let messageContent = data.suggestion;
      let codeSnippet = '';
      let language = 'javascript';

      // Extract code blocks from markdown style response (```code```)
      const codeBlockRegex = /```(\w+)?\s*(.+?)```/s;
      const match = messageContent.match(codeBlockRegex);

      if (match) {
        if (match[1]) {
          language = match[1];
        }
        codeSnippet = match[2].trim();
        messageContent = messageContent.replace(codeBlockRegex, '').trim();
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: messageContent,
        codeSnippet: codeSnippet || undefined,
        language: codeSnippet ? language : undefined,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response from the AI. Please try again.',
        variant: 'destructive',
      });
      
      // Add fallback response
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <MainLayout>
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-6 w-6 text-primary" />
              AI Code Assistant
            </CardTitle>
            <CardDescription>
              Ask me anything about coding, debugging, or technical concepts
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {EXAMPLE_PROMPTS.map((prompt, index) => (
            <Card key={index} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => handleExampleClick(prompt.prompt)}>
              <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center">
                  {prompt.icon}
                  <span className="ml-2">{prompt.title}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {prompt.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="flex-1">
          <CardContent className="p-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[80%] ${
                      message.type === 'user'
                        ? 'flex-row-reverse'
                        : 'flex-row'
                    }`}
                  >
                    {message.type === 'ai' ? (
                      <Avatar className="mt-1 mr-2 h-8 w-8 bg-primary text-white">
                        <AvatarFallback>AI</AvatarFallback>
                        <Cpu className="h-4 w-4" />
                      </Avatar>
                    ) : (
                      <Avatar className="mt-1 ml-2 h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                        <AvatarFallback>{user?.firstName?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.codeSnippet && (
                        <div className="mt-2">
                          <CodeSnippet code={message.codeSnippet} language={message.language || 'javascript'} />
                        </div>
                      )}
                      <div
                        className={`text-xs mt-1 ${
                          message.type === 'user'
                            ? 'text-blue-100'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%]">
                    <Avatar className="mt-1 mr-2 h-8 w-8 bg-primary text-white">
                      <AvatarFallback>AI</AvatarFallback>
                      <Cpu className="h-4 w-4" />
                    </Avatar>
                    <div className="rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question or paste code..."
                className="flex-1 resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
