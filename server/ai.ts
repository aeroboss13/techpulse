import { GoogleGenerativeAI } from "@google/generative-ai";
import { User, Post } from "@shared/schema";

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyDgQ0QqG8slJcrgcuqRLb3RAu-iUrwrDXM");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// AI assistant powered by Google Gemini
export async function generateAiSuggestion(prompt: string): Promise<string> {
  try {
    // Create a system prompt for programming assistance
    const systemPrompt = `You are a helpful programming assistant for a social platform for IT professionals. 
    Your responses should be:
    - Practical and actionable
    - Include code examples when relevant
    - Be encouraging and supportive
    - Add relevant hashtags at the end
    - Keep responses concise but informative
    - Focus on best practices and modern approaches
    
    User question: ${prompt}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback to a helpful response
    return `I'm here to help with your programming questions! Could you provide a bit more detail about what you're working on? I can assist with:

🔧 Code debugging and optimization
💡 Best practices and design patterns  
📚 Learning new technologies
🚀 Project architecture advice

#Programming #Help #CodingSupport`;
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