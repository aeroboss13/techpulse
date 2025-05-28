import { GoogleGenerativeAI } from "@google/generative-ai";
import { User, Post } from "@shared/schema";

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyDgQ0QqG8slJcrgcuqRLb3RAu-iUrwrDXM");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// AI assistant powered by Google Gemini
export async function generateAiSuggestion(prompt: string): Promise<string> {
  try {
    // Detect language and create appropriate system prompt
    const hasRussian = /[а-яё]/i.test(prompt);
    const language = hasRussian ? 'Russian' : 'English';
    
    let systemPrompt = '';
    
    if (language === 'Russian') {
      systemPrompt = `Ты - помощник по программированию. 

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
    
    // ULTRA AGGRESSIVE hashtag removal - multiple passes
    
    // 1. Remove entire lines that contain hashtags
    const lines = text.split('\n');
    const cleanLines = lines.filter(line => !line.includes('#'));
    text = cleanLines.join('\n');
    
    // 2. Remove any hashtags that might be inline
    text = text.replace(/#\w+/g, '');
    text = text.replace(/#[\u0400-\u04FF]+/g, ''); // Cyrillic
    text = text.replace(/#[a-zA-Z]+/g, ''); // Latin
    
    // 3. Remove any remaining # symbols
    text = text.replace(/#/g, '');
    
    // 4. Clean up extra whitespace
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\n\s*\n/g, '\n');
    text = text.trim();
    
    // 5. Final check - if any hashtags still remain, cut off everything after the first one
    const hashtagIndex = text.indexOf('#');
    if (hashtagIndex !== -1) {
      text = text.substring(0, hashtagIndex).trim();
    }
    
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
        const secondLines = secondText.split('\n');
        const secondCleanLines = [];
        
        for (const line of secondLines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.includes('#') && trimmedLine.length > 0) {
            secondCleanLines.push(line);
          }
        }
        
        secondText = secondCleanLines.join('\n').trim();
        secondText = secondText.replace(/#[^\s\n]*/g, '');
        secondText = secondText.replace(/\s+/g, ' ');
        text = secondText.trim();
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