
import { useToast } from "@/components/ui/use-toast";

export type NewsSource = {
  id: string;
  name: string;
};

export type NewsArticle = {
  id: string;
  source: NewsSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  category: string;
  isTrending?: boolean;
  isBreaking?: boolean;
  isEditorsPick?: boolean;
};

// A function to fetch news by category
export async function fetchNewsByCategory(
  category: string
): Promise<NewsArticle[]> {
  try {
    // We'll use the GNews API (free tier) for demo purposes
    const apiKey = "7cf8007b5b70d184ed09b7fa0179ae3d"; // Free demo key with limited quota
    const baseUrl = "https://gnews.io/api/v4";
    
    // Define search queries for each category
    const categoryQueries: Record<string, string> = {
      trending: "trending entertainment news",
      anime: "anime news releases episodes",
      manga: "manga news releases chapters",
      bollywood: "bollywood movies news releases",
      hollywood: "hollywood movies news releases",
      tvshows: "tv series shows netflix hbo disney",
      comics: "comics marvel dc webtoon",
      kpop: "kpop music news bts blackpink",
      celebrity: "celebrity entertainment news",
      upcoming: "upcoming movies shows releases"
    };
    
    const query = categoryQueries[category] || "entertainment news";
    
    // Adjust request based on category
    const endpoint = category === "trending" 
      ? `${baseUrl}/top-headlines?topic=entertainment&apikey=${apiKey}&lang=en` 
      : `${baseUrl}/search?q=${encodeURIComponent(query)}&apikey=${apiKey}&lang=en`;
    
    console.log(`Fetching news for category: ${category}`);
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform data to match our NewsArticle type
    return data.articles.map((article: any, index: number) => ({
      id: `${category}-${index}-${Date.now()}`,
      source: {
        id: article.source?.id || "gnews",
        name: article.source?.name || "GNews"
      },
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      content: article.content,
      category,
      isTrending: Math.random() > 0.7,
      isBreaking: Math.random() > 0.9,
      isEditorsPick: Math.random() > 0.8
    }));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

// A function to handle errors when fetching news fails
export function handleNewsError(error: Error): void {
  const { toast } = useToast();
  
  console.error("Error fetching news:", error);
  
  toast({
    title: "Failed to load news",
    description: "Could not connect to news sources. Please try again later.",
    variant: "destructive",
  });
}

// Function to refresh news data based on category
export async function refreshNews(category: string): Promise<NewsArticle[]> {
  try {
    const articles = await fetchNewsByCategory(category);
    return articles;
  } catch (error) {
    console.error("Error refreshing news:", error);
    throw error;
  }
}
