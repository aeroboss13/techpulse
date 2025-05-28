import { User, Post } from "@shared/schema";

// Local AI assistant without external dependencies
export async function generateAiSuggestion(prompt: string): Promise<string> {
  // Provide helpful programming responses based on keywords
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("react") || lowerPrompt.includes("component")) {
      return `Here's a React tip: Consider using React.memo() for components that re-render frequently with the same props. This can significantly improve performance! 

\`\`\`jsx
const MyComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});
\`\`\`

#React #Performance #WebDev`;
    }
    
    if (lowerPrompt.includes("javascript") || lowerPrompt.includes("js")) {
      return `JavaScript pro tip: Use optional chaining (?.) to safely access nested object properties without errors!

\`\`\`js
// Instead of this:
if (user && user.profile && user.profile.settings) {
  console.log(user.profile.settings.theme);
}

// Use this:
console.log(user?.profile?.settings?.theme);
\`\`\`

#JavaScript #ES2020 #CleanCode`;
    }
    
    if (lowerPrompt.includes("python") || lowerPrompt.includes("data")) {
      return `Python data processing tip: Use list comprehensions for cleaner, faster code!

\`\`\`python
# Instead of loops:
result = []
for item in data:
    if item > 0:
        result.append(item * 2)

# Use comprehension:
result = [item * 2 for item in data if item > 0]
\`\`\`

#Python #DataScience #Optimization`;
    }
    
    if (lowerPrompt.includes("bug") || lowerPrompt.includes("debug")) {
      return `Debugging strategy that works every time:

1. 🔍 **Reproduce** the issue consistently
2. 📝 **Log** key variables at each step  
3. 🔬 **Isolate** the problem area
4. 🧪 **Test** your hypothesis
5. ✅ **Verify** the fix

The key is being systematic, not rushing! What specific issue are you facing?

#Debugging #ProblemSolving #DevTips`;
    }
    
    if (lowerPrompt.includes("algorithm") || lowerPrompt.includes("performance")) {
      return `Algorithm optimization tip: Always consider time complexity!

Common patterns:
• O(1) - Hash maps for lookups
• O(log n) - Binary search on sorted data  
• O(n) - Single pass through data
• O(n²) - Nested loops (often can be improved!)

Which algorithm are you working on? I can suggest specific optimizations!

#Algorithms #BigO #Performance`;
    }
    
  // Default response for general programming questions
  return `Great question! Here are some general programming principles that always help:

🎯 **Write clear, readable code** - Your future self will thank you
🧪 **Test early and often** - Catch bugs before they multiply  
📚 **Keep learning** - Technology evolves fast
🤝 **Ask for help** - Code reviews make everyone better

What specific technology or problem are you working with? I'd love to provide more targeted advice!

#Programming #BestPractices #ContinuousLearning`;

}

// Function to analyze a post's content and provide improvement suggestions
export async function analyzePost(postContent: string): Promise<{
  suggestions: string[];
  topics: {name: string, relevance: number}[];
  sentiment: 'positive' | 'neutral' | 'negative';
  readability: 'easy' | 'medium' | 'complex';
}> {
  try {
    const content = postContent.toLowerCase();
    const suggestions: string[] = [];
    const topics: {name: string, relevance: number}[] = [];
    
    // Analyze content for suggestions
    if (!content.includes('```') && !content.includes('code')) {
      suggestions.push("Add a code example to illustrate your point");
    }
    
    if (!content.includes('#')) {
      suggestions.push("Include relevant hashtags to increase visibility");
    }
    
    if (!content.includes('?')) {
      suggestions.push("Ask a question to encourage community discussion");
    }
    
    if (content.length < 50) {
      suggestions.push("Expand your post with more details or context");
    }
    
    if (content.length > 500) {
      suggestions.push("Consider breaking this into multiple posts for better engagement");
    }
    
    // Detect technical topics
    const techKeywords = [
      { name: 'JavaScript', keywords: ['javascript', 'js', 'react', 'node', 'vue', 'angular'] },
      { name: 'Python', keywords: ['python', 'django', 'flask', 'pandas', 'numpy'] },
      { name: 'Web Development', keywords: ['html', 'css', 'frontend', 'backend', 'api'] },
      { name: 'Database', keywords: ['sql', 'mongodb', 'database', 'postgresql', 'mysql'] },
      { name: 'DevOps', keywords: ['docker', 'kubernetes', 'aws', 'cloud', 'deployment'] },
      { name: 'Mobile', keywords: ['mobile', 'android', 'ios', 'flutter', 'react native'] }
    ];
    
    techKeywords.forEach(tech => {
      const matches = tech.keywords.filter(keyword => content.includes(keyword));
      if (matches.length > 0) {
        topics.push({
          name: tech.name,
          relevance: Math.min(matches.length / tech.keywords.length, 1)
        });
      }
    });
    
    // Determine sentiment
    const positiveWords = ['great', 'awesome', 'love', 'amazing', 'excellent', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'broken', 'frustrating'];
    
    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;
    
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    if (negativeCount > positiveCount) sentiment = 'negative';
    
    // Determine readability
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    let readability: 'easy' | 'medium' | 'complex' = 'medium';
    if (avgWordsPerSentence < 15) readability = 'easy';
    if (avgWordsPerSentence > 25) readability = 'complex';
    
    return {
      suggestions,
      topics,
      sentiment,
      readability
    };
  } catch (error) {
    console.error("Error analyzing post:", error);
    
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
  const ideas: string[] = [];
  
  const ideaTemplates = [
    "Share your experience with {topic} and how it improved your development workflow",
    "Post a code snippet demonstrating a clever {topic} technique you discovered recently",
    "Discuss common {topic} mistakes and how to avoid them", 
    "Explain a complex {topic} concept using simple, real-world analogies",
    "Share your favorite {topic} tools and resources that every developer should know",
    "Write about the latest updates in {topic} and their impact on development",
    "Create a beginner's guide to getting started with {topic}",
    "Compare different approaches to solving problems in {topic}",
    "Share a challenging {topic} project you completed and lessons learned",
    "Discuss best practices for {topic} that you wish you knew earlier"
  ];
  
  for (let i = 0; i < count && i < ideaTemplates.length; i++) {
    const template = ideaTemplates[i];
    const topic = topics[i % topics.length] || "programming";
    ideas.push(template.replace('{topic}', topic));
  }
  
  return ideas;
}

// AI recommendation function with local suggestions
export async function getAiRecommendations(
  user: User | undefined,
  userPosts: Post[],
  likedPosts: Post[]
): Promise<Post[]> {
  const recommendations: Post[] = [];
  
  // Create educational recommendations
  recommendations.push({
    id: "rec1",
    userId: "ai-rec-1",
    content: "Built a performance optimization that reduced our React app load time by 60%! Here's the key technique:",
    codeSnippet: `// Lazy loading components with React.lazy()
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}`,
    language: "javascript",
    tags: ["React", "Performance"],
    likes: 203,
    comments: 18,
    isAiRecommended: true,
    aiRecommendationReason: "Recommended based on popular React optimization techniques",
    image: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  });
  
  recommendations.push({
    id: "rec2", 
    userId: "ai-rec-2",
    content: "Python developers: This one-liner can save you hours of debugging! 🐍✨",
    codeSnippet: `# Use the walrus operator for cleaner conditionals
if (n := len(data)) > 10:
    print(f"Processing {n} items...")
    
# Instead of:
# n = len(data)
# if n > 10:
#     print(f"Processing {n} items...")`,
    language: "python",
    tags: ["Python", "Tips"],
    likes: 142,
    comments: 24,
    isAiRecommended: true,
    aiRecommendationReason: "Educational content about modern Python features",
    image: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  });
  
  return recommendations;
}