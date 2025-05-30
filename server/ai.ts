import { GoogleGenerativeAI } from "@google/generative-ai";
import { User, Post } from "@shared/schema";

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI("твой ключ");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// Helper function to completely remove hashtags
function removeHashtagsCompletely(text: string): string {
  // Find the first # symbol and cut everything from there
  const hashtagIndex = text.indexOf('#');
  if (hashtagIndex !== -1) {
    text = text.substring(0, hashtagIndex);
  }
  
  // Clean up any remaining whitespace
  text = text.trim();
  
  return text;
}

// AI assistant powered by Google Gemini
export async function generateAiSuggestion(prompt: string): Promise<string> {
  try {
    // Detect language and create appropriate system prompt
    const hasRussian = /[а-яё]/i.test(prompt);
    const language = hasRussian ? 'Russian' : 'English';
    
    let systemPrompt = '';
    
    if (language === 'Russian') {
      systemPrompt = `Ты - помощник по аналитики постов в социальной сети для айтишников, а также можешь помогать в написании кода и его анализа. 

СТРОГИЕ ПРАВИЛА:
- Отвечай ТОЛЬКО на русском языке
- ЗАПРЕЩЕНО использовать хештеги (#)
- ЗАПРЕЩЕНО смешивать языки
- Будь практичным и конкретным

Вопрос: ${prompt}

Ответь на русском языке без хештегов.`;
    } else {
      systemPrompt = `You are a programming assistant.

STRICT RULES:
- Answer ONLY in English
- NO hashtags (#) allowed
- NO language mixing
- Be practical and specific

Question: ${prompt}

Answer in English without hashtags.`;
    }

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let text = response.text();
    
    // COMPLETE hashtag removal - multiple methods to ensure all hashtags are removed
    // Method 1: Cut at first hashtag
    let hashtagIndex = text.indexOf('#');
    if (hashtagIndex !== -1) {
      text = text.substring(0, hashtagIndex);
    }
    
    // Method 2: Remove any remaining hashtags with regex
    text = text.replace(/#\w+/g, '');
    
    // Method 3: Remove lines that might contain hashtags
    text = text.split('\n')
      .filter(line => !line.includes('#'))
      .join('\n');
    
    // Final cleanup
    text = text.trim();
    
    // If AI responded in wrong language, make a second attempt with more explicit prompt
    if (language === 'Russian' && !/[а-яё]/i.test(text.slice(0, 100))) {
      const secondPrompt = `ОТВЕЧАЙ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ! Не используй английский!
      
      Пользователь спрашивает: ${prompt}
      
      Дай практичный ответ о программировании НА РУССКОМ ЯЗЫКЕ с примерами кода.`;
      
      try {
        const secondResult = await model.generateContent(secondPrompt);
        const secondResponse = await secondResult.response;
        let secondText = secondResponse.text();
        
        // Clean up second response too
        text = removeHashtagsCompletely(secondText);
      } catch (secondError) {
        console.error("Error with second AI attempt:", secondError);
        // Keep original text if second attempt fails
      }
    }
    
    return text;
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback response based on detected language
    const hasRussian = /[а-яё]/i.test(prompt);
    
    if (hasRussian) {
      return `Я здесь, чтобы помочь с вашими вопросами по программированию! Можете предоставить больше деталей о том, над чем вы работаете? Я могу помочь с:

🔧 Отладка и оптимизация кода
💡 Лучшие практики и паттерны проектирования
📚 Изучение новых технологий
🚀 Советы по архитектуре проектов`;
    } else {
      return `I'm here to help with your programming questions! Could you provide a bit more detail about what you're working on? I can assist with:

🔧 Code debugging and optimization
💡 Best practices and design patterns  
📚 Learning new technologies
🚀 Project architecture advice`;
    }
  }
}

// Function to analyze a post's content and provide improvement suggestions
export async function analyzePost(postContent: string): Promise<{
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  suggestions: string[];
}> {
  const lowerContent = postContent.toLowerCase();
  
  // Simple sentiment analysis based on keywords
  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  
  const positiveWords = ["good", "great", "awesome", "excellent", "love", "amazing", "perfect", "best"];
  const negativeWords = ["bad", "terrible", "awful", "hate", "worst", "problem", "issue", "bug"];
  
  const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
  
  if (positiveCount > negativeCount) sentiment = "positive";
  else if (negativeCount > positiveCount) sentiment = "negative";
  
  // Extract topics based on common programming keywords
  const topics: string[] = [];
  const techKeywords = [
    "javascript", "react", "python", "node", "css", "html", "typescript",
    "vue", "angular", "backend", "frontend", "database", "api", "git"
  ];
  
  techKeywords.forEach(keyword => {
    if (lowerContent.includes(keyword)) {
      topics.push(keyword);
    }
  });
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  if (postContent.length < 50) {
    suggestions.push("Consider adding more details to make your post more engaging");
  }
  
  if (!postContent.includes("#")) {
    suggestions.push("Add relevant hashtags to increase visibility");
  }
  
  if (topics.length > 0) {
    suggestions.push(`Great tech content! Consider sharing code examples for ${topics[0]}`);
  }
  
  return { sentiment, topics, suggestions };
}

// Function to generate content ideas based on trending topics
export async function generateContentIdeas(topics: string[], count: number = 5): Promise<string[]> {
  const ideas = [
    "Share a code snippet that solved a tricky problem",
    "Write about a new technology you're learning",
    "Discuss best practices in your favorite programming language",
    "Share a debugging story and what you learned",
    "Review a tool or library you've been using",
    "Explain a complex concept in simple terms",
    "Share your development environment setup",
    "Discuss the pros and cons of different frameworks",
    "Write about a project you're working on",
    "Share tips for junior developers"
  ];
  
  return ideas.slice(0, count);
}

// Function to get AI-powered recommendations for posts
export async function getAiRecommendations(
  userInterests: string[],
  recentPosts: Post[]
): Promise<Post[]> {
  // Simple recommendation based on content matching
  const recommendedPosts = recentPosts.filter(post => {
    const postContent = post.content.toLowerCase();
    return userInterests.some(interest => 
      postContent.includes(interest.toLowerCase())
    );
  });
  
  return recommendedPosts.slice(0, 5);
}
