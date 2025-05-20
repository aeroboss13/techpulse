import { User, Post } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to generate AI suggestions using OpenAI API
export async function generateAiSuggestion(prompt: string): Promise<string> {
  try {
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for a social media platform for developers called DevStream. 
          You help developers with technical questions, generate code examples, and provide suggestions to improve their posts.
          Your responses should be concise, technical, and in the style of a professional developer.
          Include emojis sparingly and appropriate hashtags when they make sense.
          When providing code, make sure it's well-formatted and correct.
          Limit your responses to 250 words maximum.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    
    // Fallback response for API errors
    if (prompt.includes("bug") || prompt.includes("error")) {
      return `I recently encountered a challenging bug in my codebase that had me puzzled for hours. After careful debugging and tracing through the execution flow, I discovered that the issue was related to an unexpected state mutation. The fix was surprisingly simple: implementing proper immutability patterns solved the problem entirely! 💡 #DebuggingWins #CleanCode`;
    } 
    
    if (prompt.includes("learn") || prompt.includes("studying")) {
      return `I've been diving deep into advanced TypeScript patterns lately and it's been a game-changer for my development workflow. Type safety combined with powerful generics has eliminated an entire category of bugs in our production systems. Highly recommend investing time to master these concepts! 📚 #TypeScript #ContinuousLearning`;
    }
    
    return `Just had a breakthrough moment refactoring our codebase! Reduced complexity by 40% and improved performance by implementing proper design patterns. Code quality matters more than we often realize! 💻 #CleanCode #Refactoring`;
  }
}

// Function to analyze a post's content and provide improvement suggestions
export async function analyzePost(postContent: string): Promise<{
  suggestions: string[];
  topics: {name: string, relevance: number}[];
  sentiment: 'positive' | 'neutral' | 'negative';
  readability: 'easy' | 'medium' | 'complex';
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `Analyze this developer's social media post and provide:
          1. A list of 3-5 specific suggestions to improve engagement
          2. Key technical topics mentioned with relevance scores (0.0-1.0)
          3. Overall sentiment (positive, neutral, or negative)
          4. Readability assessment (easy, medium, or complex)
          
          Return your analysis in JSON format with these keys:
          - suggestions: string[]
          - topics: array of {name: string, relevance: number}
          - sentiment: "positive" | "neutral" | "negative"
          - readability: "easy" | "medium" | "complex" 
          `
        },
        { role: "user", content: postContent }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      suggestions: result.suggestions || [],
      topics: result.topics || [],
      sentiment: result.sentiment || 'neutral',
      readability: result.readability || 'medium'
    };
  } catch (error) {
    console.error("Error analyzing post with OpenAI:", error);
    
    // Fallback response
    return {
      suggestions: [
        "Add a code example to illustrate your point",
        "Include relevant technical hashtags",
        "Ask a question to encourage responses"
      ],
      topics: [
        {name: "Development", relevance: 0.9},
        {name: "Programming", relevance: 0.8}
      ],
      sentiment: 'neutral',
      readability: 'medium'
    };
  }
}

// Function to generate content ideas based on user's interests
export async function generateContentIdeas(topics: string[], count: number = 5): Promise<string[]> {
  try {
    const topicsString = topics.join(", ");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `Generate ${count} creative post ideas for a developer to share on a technical social media platform.
          The ideas should be related to these topics: ${topicsString}.
          Each idea should be engaging, showcase technical expertise, and encourage discussion.
          Format each idea as a single paragraph of 1-2 sentences.
          Return the ideas as a JSON array of strings.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.ideas || [];
  } catch (error) {
    console.error("Error generating content ideas with OpenAI:", error);
    
    // Fallback ideas
    return [
      "Share your experience with the latest framework update and how it improved your development workflow.",
      "Post a code snippet that demonstrates a clever optimization technique you discovered recently.",
      "Discuss a challenging bug you solved and the debugging process that led to the solution.",
      "Explain a complex technical concept using a simple, real-world analogy that anyone can understand.",
      "Share your top 3 productivity tools or VSCode extensions that every developer should know about."
    ];
  }
}

// AI recommendation function - uses both mock data and AI generation
export async function getAiRecommendations(
  user: User | undefined,
  userPosts: Post[],
  likedPosts: Post[]
): Promise<Post[]> {
  // Create base recommendations with mock data
  const recommendations: Post[] = [];
  
  // Add mock recommendations for consistent experience
  recommendations.push({
    id: "rec1",
    userId: "ai-rec-1",
    content: "Built a simple pandas trick that boosted my data processing pipeline by 70%. Here's the before and after:",
    codeSnippet: `# Before: Slow iterative approach
for index, row in df.iterrows():
    # process each row
    result = process_data(row)
    results.append(result)

# After: Vectorized operations
df['processed'] = df.apply(process_data, axis=1)
# OR even better
df['processed'] = process_data_vectorized(df)`,
    language: "python",
    tags: ["Python", "DataScience"],
    likes: 203,
    comments: 18,
    isAiRecommended: true,
    aiRecommendationReason: "Recommended based on your interest in Python and Data Science",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  });
  
  // Create a React performance recommendation
  recommendations.push({
    id: "rec2",
    userId: "ai-rec-2",
    content: "Just solved a tricky React performance issue with useMemo. Remember folks: not all renders are created equal! 🚀",
    codeSnippet: `// Before: Re-computing on every render 😱
const filteredItems = items.filter(item => 
  item.name.includes(searchTerm)
);

// After: Only recompute when dependencies change 🎉
const filteredItems = React.useMemo(() => {
  return items.filter(item => 
    item.name.includes(searchTerm)
  );
}, [items, searchTerm]);`,
    language: "javascript",
    tags: ["React", "Performance"],
    likes: 142,
    comments: 24,
    isAiRecommended: true,
    aiRecommendationReason: "Recommended based on your frontend development activity",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  });
  
  // Attempt to generate a personalized recommendation if we have user data
  try {
    if (user && (userPosts.length > 0 || likedPosts.length > 0)) {
      // Extract topics from user's posts and likes
      const userTopics = new Set<string>();
      
      userPosts.forEach(post => {
        post.tags?.forEach(tag => userTopics.add(tag));
      });
      
      likedPosts.forEach(post => {
        post.tags?.forEach(tag => userTopics.add(tag));
      });
      
      // If we have topics, generate a personalized recommendation
      if (userTopics.size > 0) {
        const topicsArray = Array.from(userTopics).slice(0, 5);
        const ideas = await generateContentIdeas(topicsArray, 1);
        
        if (ideas.length > 0) {
          // Create AI-generated personalized recommendation
          recommendations.push({
            id: "rec-personalized",
            userId: "ai-personalized",
            content: ideas[0],
            tags: topicsArray,
            likes: Math.floor(Math.random() * 100) + 50,
            comments: Math.floor(Math.random() * 20) + 5,
            isAiRecommended: true,
            aiRecommendationReason: `Personalized recommendation based on your interests in ${topicsArray.join(", ")}`,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }
  } catch (error) {
    console.error("Error generating personalized recommendation:", error);
  }
  
  return recommendations;
}
