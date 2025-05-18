
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { NewsGrid } from "@/components/NewsGrid";
import { FeaturedNews } from "@/components/FeaturedNews";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  fetchNewsByCategory,
  handleNewsError,
  type NewsArticle,
} from "@/services/newsService";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("trending");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      try {
        const fetchedArticles = await fetchNewsByCategory(activeCategory);
        setArticles(fetchedArticles);
        
        // Set the first article as featured if it has an image
        const withImages = fetchedArticles.filter(a => a.urlToImage);
        if (withImages.length > 0) {
          setFeaturedArticle(withImages[0]);
          // Remove the featured article from the grid
          setArticles(fetchedArticles.filter(a => a.id !== withImages[0].id));
        } else {
          setFeaturedArticle(undefined);
        }
      } catch (error) {
        handleNewsError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, [activeCategory]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fetchedArticles = await fetchNewsByCategory(activeCategory);
      setArticles(fetchedArticles);
      
      const withImages = fetchedArticles.filter(a => a.urlToImage);
      if (withImages.length > 0) {
        setFeaturedArticle(withImages[0]);
        setArticles(fetchedArticles.filter(a => a.id !== withImages[0].id));
      }
      
      toast({
        title: "News refreshed",
        description: "Latest headlines have been loaded",
        duration: 3000,
      });
    } catch (error) {
      handleNewsError(error as Error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container pt-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-playfair font-bold">
            {activeCategory === "trending" ? "Top Stories" : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
          </h2>
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
        </div>
        
        <CategoryNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        
        <div className="mt-6">
          <FeaturedNews article={featuredArticle} />
          <NewsGrid articles={articles} isLoading={isLoading} />
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
