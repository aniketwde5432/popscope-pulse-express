
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { NewsGrid } from "@/components/NewsGrid";
import { FeaturedNews } from "@/components/FeaturedNews";
import { CategoryBanners } from "@/components/CategoryBanner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";
import {
  fetchNewsByCategory,
  handleNewsError,
  type NewsArticle,
} from "@/services/newsService";
import { useToast } from "@/components/ui/use-toast";

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("trending");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadNews = useCallback(async (category: string, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const fetchedArticles = await fetchNewsByCategory(category);
      
      if (fetchedArticles.length === 0) {
        setArticles([]);
        setFeaturedArticle(undefined);
        return;
      }
      
      // Set the first article with image as featured if available
      const withImages = fetchedArticles.filter(a => a.urlToImage);
      if (withImages.length > 0) {
        setFeaturedArticle(withImages[0]);
        // Remove the featured article from the grid
        setArticles(fetchedArticles.filter(a => a.id !== withImages[0].id));
      } else if (fetchedArticles.length > 0) {
        // If no articles with images, still set a featured article
        setFeaturedArticle(fetchedArticles[0]);
        setArticles(fetchedArticles.slice(1));
      } else {
        setFeaturedArticle(undefined);
        setArticles([]);
      }
      
      // Update last refresh time
      setLastRefresh(new Date());
    } catch (error) {
      handleNewsError(error as Error);
    } finally {
      if (showLoading) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadNews(activeCategory);
  }, [activeCategory, loadNews]);

  // Setup periodic refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadNews(activeCategory, false);
    }, REFRESH_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [activeCategory, loadNews]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNews(activeCategory, false);
    
    toast({
      title: "News refreshed",
      description: "Latest headlines have been loaded",
      duration: 3000,
    });
  };

  // Format the last refresh time
  const getLastRefreshTime = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastRefresh.getTime();
    const diffMins = Math.round(diffMs / 60000); // convert to minutes
    
    if (diffMins < 1) return "just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs === 1) return "1 hour ago";
    return `${diffHrs} hours ago`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container pt-6 pb-12">
        <section className="mb-10">
          <h2 className="text-2xl font-playfair font-bold mb-6">Explore Categories</h2>
          <CategoryBanners />
        </section>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-playfair font-bold">
            {activeCategory === "trending" ? "Top Stories" : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground text-sm hidden md:flex items-center">
              <Clock size={14} className="mr-1" />
              <span>Updated {getLastRefreshTime()}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="rounded-full"
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin mr-2" : "mr-2"} />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(`/category/${activeCategory}`)}
              className="rounded-full"
            >
              View All
            </Button>
          </div>
        </div>
        
        <CategoryNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        
        <div className="mt-6">
          <FeaturedNews article={featuredArticle} />
          <NewsGrid 
            articles={articles} 
            isLoading={isLoading} 
            onRefresh={handleRefresh}
          />
        </div>
      </main>
      
      <footer className="bg-muted py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-playfair font-bold text-primary">
                PopScope <span className="text-foreground">Express</span>
              </h2>
              <p className="text-sm text-muted-foreground">Your real-time pop culture news platform</p>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} PopScope Express. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
