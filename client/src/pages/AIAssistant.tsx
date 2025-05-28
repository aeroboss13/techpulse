import { useState, useRef, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Send, Bot, Cpu, Code, Sparkles, FileCode, BookOpen, 
  LineChart, TrendingUp, BarChart, PieChart, Target, Lightbulb, 
  MessageSquare, User, Hash
} from 'lucide-react';
import CodeSnippet from '@/components/CodeSnippet';
import { useQuery } from '@tanstack/react-query';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  codeSnippet?: string;
  language?: string;
  timestamp: Date;
}

interface PostAnalysis {
  id: string;
  content: string;
  engagement: number;
  suggestions: string[];
  topics: Array<{name: string, relevance: number}>;
  sentiment: 'positive' | 'neutral' | 'negative';
  readability: 'easy' | 'medium' | 'complex';
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

const POST_ANALYSIS_PROMPTS = [];

// Mock data for post analysis
const MOCK_POSTS_FOR_ANALYSIS: PostAnalysis[] = [
  {
    id: '1',
    content: 'Just learned about React Hooks - they make functional components so much more powerful! #React #JavaScript #WebDev',
    engagement: 78,
    suggestions: [
      'Add a code example showing a practical use case',
      'Compare with class components to highlight advantages',
      'Link to the official React documentation'
    ],
    topics: [
      {name: 'React', relevance: 0.95},
      {name: 'JavaScript', relevance: 0.82},
      {name: 'WebDev', relevance: 0.75}
    ],
    sentiment: 'positive',
    readability: 'easy'
  },
  {
    id: '2',
    content: 'Having issues with TypeScript generics in my latest project. The compiler keeps complaining about type narrowing when using Array.filter(). Any suggestions? #TypeScript #JavaScript #Debugging',
    engagement: 45,
    suggestions: [
      'Include a minimal code example showing the error',
      'Specify TypeScript version you\'re using',
      'Ask a clear question for better responses',
      'Add types for your filter function'
    ],
    topics: [
      {name: 'TypeScript', relevance: 0.97},
      {name: 'JavaScript', relevance: 0.75},
      {name: 'Debugging', relevance: 0.82}
    ],
    sentiment: 'neutral',
    readability: 'medium'
  },
  {
    id: '3',
    content: 'Performance optimization tip: Use React.memo() to prevent unnecessary re-renders in your functional components. I just reduced render time by 45% in our production app! #React #Performance #WebDev #JavaScript',
    engagement: 92,
    suggestions: [
      'Share before/after metrics or a performance profile',
      'Explain when NOT to use React.memo()',
      'Mention other performance optimization techniques'
    ],
    topics: [
      {name: 'React', relevance: 0.90},
      {name: 'Performance', relevance: 0.95},
      {name: 'JavaScript', relevance: 0.65}
    ],
    sentiment: 'positive',
    readability: 'medium'
  }
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
  const [selectedPost, setSelectedPost] = useState<PostAnalysis | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Принудительно обновляем компонент при смене языка
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [language]);

  // Загружаем реальные посты пользователя
  const { data: userPosts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: [`/api/posts/user/${user?.id}`],
    enabled: !!user?.id,
  });

  // Преобразуем посты пользователя в формат для анализа
  const postsForAnalysis: PostAnalysis[] = Array.isArray(userPosts) ? userPosts.map((post: any) => ({
    id: post.id,
    content: post.content,
    engagement: (post.likes || 0) + (post.comments || 0),
    suggestions: generateSuggestions(post),
    topics: extractTopics(post.content),
    sentiment: analyzeSentiment(post.content),
    readability: analyzeReadability(post.content)
  })) : [];

  // Функции для анализа постов
  function generateSuggestions(post: any): string[] {
    const suggestions = [];
    if (post.content.length < 50) {
      suggestions.push(language === 'en' ? 'Consider adding more details to make your post more engaging' : 'Добавьте больше деталей для повышения вовлеченности');
    }
    if (!post.content.includes('#')) {
      suggestions.push(language === 'en' ? 'Add relevant hashtags to increase visibility' : 'Добавьте релевантные хештеги для увеличения видимости');
    }
    if (post.codeSnippet) {
      suggestions.push(language === 'en' ? 'Great code example! Consider explaining how it works' : 'Отличный пример кода! Объясните, как он работает');
    }
    if (suggestions.length === 0) {
      suggestions.push(language === 'en' ? 'Great post! Consider sharing more technical insights' : 'Отличный пост! Поделитесь большим количеством технических деталей');
    }
    return suggestions;
  }

  function extractTopics(content: string): Array<{name: string, relevance: number}> {
    const techKeywords = ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'CSS', 'HTML', 'Vue', 'Angular', 'API', 'Database', 'Docker', 'Git'];
    const topics = [];
    const lowerContent = content.toLowerCase();
    
    for (const keyword of techKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        const matches = content.match(new RegExp(keyword, 'g')) || [];
        const relevance = matches.length * 0.3;
        topics.push({ name: keyword, relevance: Math.min(relevance, 1) });
      }
    }
    
    return topics.slice(0, 3);
  }

  function analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['great', 'awesome', 'excellent', 'love', 'amazing', 'perfect', 'отлично', 'прекрасно', 'замечательно'];
    const negativeWords = ['terrible', 'awful', 'hate', 'horrible', 'worst', 'ужасно', 'плохо', 'кошмар'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  function analyzeReadability(content: string): 'easy' | 'medium' | 'complex' {
    const words = content.split(' ').length;
    if (words < 20) return 'easy';
    if (words < 50) return 'medium';
    return 'complex';
  }

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
      // Вызов OpenAI API для получения ответа
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

      // Проверка наличия кода в ответе
      let messageContent = data.suggestion;
      let codeSnippet = '';
      let language = 'javascript';

      // Извлечение блоков кода из ответа в стиле markdown (```code```)
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
      
      // Если сообщение содержит просьбу проанализировать пост или контент
      if (userMessage.content.toLowerCase().includes('analyze') || 
          userMessage.content.toLowerCase().includes('анализ') ||
          userMessage.content.toLowerCase().includes('проанализир')) {
        // Пробуем найти контент для анализа
        const contentMatch = userMessage.content.match(/analyze\s+this[:\s]+(.*)/i) || 
                             userMessage.content.match(/анализ[а-я]*\s+[а-я]*[:\s]+(.*)/i);
        
        if (contentMatch && contentMatch[1]) {
          const contentToAnalyze = contentMatch[1].trim();
          
          // Анализируем контент через AI
          try {
            const analysisResponse = await fetch('/api/ai/analyze-post', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ content: contentToAnalyze }),
            });
            
            if (analysisResponse.ok) {
              const analysis = await analysisResponse.json();
              
              // Формируем дополнительное сообщение с анализом
              let analysisContent = language === 'en' 
                ? "Here's my analysis of the content:\n\n" 
                : "Вот мой анализ контента:\n\n";
              
              analysisContent += language === 'en' 
                ? `**Sentiment**: ${analysis.sentiment}\n` 
                : `**Тональность**: ${analysis.sentiment === 'positive' ? 'позитивная' : analysis.sentiment === 'negative' ? 'негативная' : 'нейтральная'}\n`;
              
              analysisContent += language === 'en' 
                ? `**Readability**: ${analysis.readability}\n\n` 
                : `**Читаемость**: ${analysis.readability === 'easy' ? 'простая' : analysis.readability === 'complex' ? 'сложная' : 'средняя'}\n\n`;
              
              analysisContent += language === 'en' ? "**Suggestions**:\n" : "**Рекомендации**:\n";
              analysis.suggestions.forEach((suggestion: string) => {
                analysisContent += `- ${suggestion}\n`;
              });
              
              analysisContent += '\n';
              
              analysisContent += language === 'en' ? "**Topics**:\n" : "**Темы**:\n";
              analysis.topics.forEach((topic: {name: string, relevance: number}) => {
                analysisContent += `- ${topic.name} (${Math.round(topic.relevance * 100)}%)\n`;
              });
              
              const analysisMessage: Message = {
                id: Date.now().toString() + '-analysis',
                type: 'ai',
                content: analysisContent,
                timestamp: new Date(),
              };
              
              setMessages(prev => [...prev, analysisMessage]);
            }
          } catch (error) {
            console.error('Error analyzing content:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response from the AI. Please try again.',
        variant: 'destructive',
      });
      
      // Добавляем запасной ответ
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: language === 'en' 
          ? "I'm sorry, I encountered an error processing your request. Please try again later." 
          : "Извините, я столкнулся с ошибкой при обработке вашего запроса. Пожалуйста, попробуйте позже.",
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

  const handleSelectPost = (post: PostAnalysis) => {
    setSelectedPost(post);
  };
  
  const analyzeCustomPost = async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Запрос к API для анализа контента
      const response = await fetch('/api/ai/analyze-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze post');
      }
      
      const data = await response.json();
      
      // Обновляем выбранный пост с результатами анализа
      setSelectedPost(prev => {
        if (prev?.id === 'custom') {
          return {
            ...prev,
            suggestions: data.suggestions || [],
            topics: data.topics || [],
            sentiment: data.sentiment || 'neutral',
            readability: data.readability || 'medium',
          };
        }
        return prev;
      });
      
      toast({
        title: language === 'en' ? 'Analysis Complete' : 'Анализ выполнен',
        description: language === 'en' ? 'Content has been analyzed successfully' : 'Контент был успешно проанализирован',
      });
      
    } catch (error) {
      console.error('Error analyzing post:', error);
      toast({
        title: language === 'en' ? 'Analysis Failed' : 'Анализ не удался',
        description: language === 'en' ? 'Failed to analyze content. Please try again.' : 'Не удалось проанализировать контент. Пожалуйста, попробуйте снова.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getReadabilityLabel = (readability: 'easy' | 'medium' | 'complex') => {
    switch (readability) {
      case 'easy': return { label: t('ai.easyRead'), color: 'text-green-500' };
      case 'medium': return { label: t('ai.moderateComplex'), color: 'text-yellow-500' };
      case 'complex': return { label: t('ai.complex'), color: 'text-red-500' };
      default: return { label: t('ai.unknown'), color: 'text-gray-500' };
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-6 w-6 text-primary" />
{t('ai.title')}
            </CardTitle>
            <CardDescription>
              {t('ai.description')}
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code" className="flex items-center">
              <Code className="h-4 w-4 mr-2" />
              {t('ai.askQuestion')}
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center">
              <LineChart className="h-4 w-4 mr-2" />
              {t('ai.contentAnalysis')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {EXAMPLE_PROMPTS.map((prompt, index) => (
                <Card key={index} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => handleExampleClick(prompt.prompt)}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      {prompt.icon}
                      <span className="ml-2">{
                        prompt.title === 'Debug My Code' ? t('ai.debugCode') :
                        prompt.title === 'Explain a Concept' ? t('ai.explainConcept') :
                        prompt.title === 'Generate Code' ? t('ai.generateCode') :
                        t('ai.optimizeSolution')
                      }</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
{
                        prompt.description === 'Help me find issues in my code' ? t('ai.debugDescription') :
                        prompt.description === 'Get explanations for technical topics' ? t('ai.explainDescription') :
                        prompt.description === 'Get code for a specific task' ? t('ai.generateDescription') :
                        t('ai.optimizeDescription')
                      }
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
                            <span>{language === 'en' ? 'Thinking...' : 'Обработка...'}</span>
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
                    placeholder={language === 'en' ? "Ask a question or paste code..." : "Задайте вопрос или вставьте код..."}
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
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {POST_ANALYSIS_PROMPTS.map((prompt, index) => (
                <Card key={index} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => handleExampleClick(prompt.prompt)}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      {prompt.icon}
                      <span className="ml-2">{language === 'en' ? prompt.title : 
                        prompt.title === 'Analyze Engagement' ? 'Анализ вовлеченности' :
                        prompt.title === 'Content Strategy' ? 'Стратегия контента' :
                        prompt.title === 'Trending Topics' ? 'Популярные темы' :
                        'Идеи для постов'}</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {language === 'en' ? prompt.description :
                        prompt.description === 'Get insights on improving post engagement' ? 'Получите советы по увеличению вовлеченности' :
                        prompt.description === 'Build a better content strategy' ? 'Создайте лучшую стратегию контента' :
                        prompt.description === 'Discover popular tech topics' ? 'Узнайте о популярных технических темах' :
                        'Генерируйте свежие идеи для контента'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      {language === 'en' ? 'Your Posts' : 'Ваши посты'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'en' ? 'Select a post to analyze' : 'Выберите пост для анализа'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 max-h-[50vh] overflow-y-auto">
                    {isLoadingPosts ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">{language === 'en' ? 'Loading your posts...' : 'Загружаем ваши посты...'}</span>
                      </div>
                    ) : postsForAnalysis.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>{language === 'en' ? 'No posts found. Create your first post to see analysis!' : 'Посты не найдены. Создайте первый пост для анализа!'}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {postsForAnalysis.map((post) => (
                          <div 
                            key={post.id} 
                            className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedPost?.id === post.id ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}
                            onClick={() => handleSelectPost(post)}
                          >
                            <p className="text-sm line-clamp-2">{post.content}</p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <div className="flex items-center mr-3">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                <span>{post.id.slice(0, 8)}...</span>
                              </div>
                              <div className="flex items-center">
                                <BarChart className="h-3 w-3 mr-1" />
                                <span>{language === 'en' ? 'Engagement' : 'Вовлеченность'}: {post.engagement}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                {selectedPost ? (
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <PieChart className="h-5 w-5 mr-2" />
                          {language === 'en' ? 'Post Analysis' : 'Анализ поста'}
                        </div>
                        <div className="flex items-center text-base font-normal">
                          <span className={getSentimentColor(selectedPost.sentiment)}>
                            {language === 'en' 
                              ? selectedPost.sentiment.charAt(0).toUpperCase() + selectedPost.sentiment.slice(1) 
                              : selectedPost.sentiment === 'positive' ? 'Позитивный' 
                                : selectedPost.sentiment === 'negative' ? 'Негативный' 
                                : 'Нейтральный'}
                          </span>
                          <span className="mx-2">•</span>
                          <span className={getReadabilityLabel(selectedPost.readability).color}>
                            {getReadabilityLabel(selectedPost.readability).label}
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">
                            {language === 'en' ? 'Post Content' : 'Содержание поста'}
                          </h3>
                          <p className="text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            {selectedPost.content}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center">
                            <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
                            {language === 'en' ? 'Improvement Suggestions' : 'Предложения по улучшению'}
                          </h3>
                          <ul className="space-y-1">
                            {selectedPost.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center">
                            <Hash className="h-4 w-4 mr-1 text-blue-500" />
                            {language === 'en' ? 'Key Topics' : 'Ключевые темы'}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedPost.topics.map((topic, idx) => (
                              <div 
                                key={idx} 
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs flex items-center"
                                style={{ opacity: 0.4 + topic.relevance * 0.6 }}
                              >
                                <span>{topic.name}</span>
                                <span className="ml-1 text-gray-500">
                                  {Math.round(topic.relevance * 100)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3">
                          <h3 className="text-sm font-medium mb-2">
                            {language === 'en' ? 'Ask AI for advice' : 'Спросить совета у ИИ'}
                          </h3>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => {
                                setInput(`How can I improve this post to increase engagement? "${selectedPost.content.substring(0, 100)}..."`);
                                document.querySelector('[data-value="code"]')?.dispatchEvent(new Event('click', { bubbles: true }));
                              }}
                            >
                              {language === 'en' ? 'Improve Engagement' : 'Улучшить вовлеченность'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => {
                                setInput(`Suggest some code examples I could add to this post: "${selectedPost.content.substring(0, 100)}..."`);
                                document.querySelector('[data-value="code"]')?.dispatchEvent(new Event('click', { bubbles: true }));
                              }}
                            >
                              {language === 'en' ? 'Add Code Examples' : 'Добавить примеры кода'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="p-8 text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-lg font-medium mb-2">
                        {language === 'en' ? 'No Post Selected' : 'Пост не выбран'}
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        {language === 'en' 
                          ? 'Select a post from the list to see AI analysis and improvement suggestions.' 
                          : 'Выберите пост из списка, чтобы увидеть ИИ-анализ и предложения по улучшению.'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
