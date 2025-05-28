import { User, Post } from "@shared/schema";

// Local AI assistant without external dependencies
export async function generateAiSuggestion(prompt: string): Promise<string> {
  // Log the received prompt for debugging
  console.log("AI received prompt:", prompt);
  
  // Provide helpful programming responses based on keywords
  const lowerPrompt = prompt.toLowerCase();
  console.log("Processed prompt:", lowerPrompt);
  
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
    return `JavaScript best practice: Use async/await instead of promise chains for cleaner, more readable code!

\`\`\`javascript
// Instead of this:
getData()
  .then(data => processData(data))
  .then(result => console.log(result))
  .catch(error => console.error(error));

// Do this:
try {
  const data = await getData();
  const result = await processData(data);
  console.log(result);
} catch (error) {
  console.error(error);
}
\`\`\`

#JavaScript #AsyncAwait #CleanCode`;
  }
  
  if (lowerPrompt.includes("python")) {
    return `Python tip: Use list comprehensions for more Pythonic and efficient code!

\`\`\`python
# Instead of:
result = []
for item in items:
    if item > 5:
        result.append(item * 2)

# Do this:
result = [item * 2 for item in items if item > 5]
\`\`\`

#Python #ListComprehensions #PythonicCode`;
  }
  
  if (lowerPrompt.includes("debug") || lowerPrompt.includes("error") || lowerPrompt.includes("bug")) {
    return `Debugging strategies that actually work:

🔍 **Use console.log strategically** - Don't spam, be targeted
🧪 **Write minimal test cases** - Isolate the problem
📝 **Read error messages carefully** - They often tell you exactly what's wrong
🔄 **Use the debugger** - Step through code line by line
🤔 **Rubber duck debugging** - Explain your code to someone (or something!)

Remember: Bugs are just undiscovered features waiting to be fixed! 

#Debugging #Programming #ProblemSolving`;
  }
  
  if (lowerPrompt.includes("algorithm") || lowerPrompt.includes("performance") || lowerPrompt.includes("optimize")) {
    return `Algorithm optimization tips:

⚡ **Know your Big O** - O(n²) can become O(n log n) with the right approach
📊 **Profile before optimizing** - Measure what's actually slow
🎯 **Choose the right data structure** - Arrays vs Objects vs Maps
🔄 **Cache expensive operations** - Don't recalculate the same thing

\`\`\`javascript
// Example: Use Map for O(1) lookups instead of Array.find()
const userMap = new Map(users.map(u => [u.id, u]));
const user = userMap.get(userId); // O(1) instead of O(n)
\`\`\`

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