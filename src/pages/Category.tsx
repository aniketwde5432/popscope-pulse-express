
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { NewsGrid } from "@/components/NewsGrid";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { fetchNewsByCategory, handleNewsError, type NewsArticle } from "@/services/newsService";
import { useToast } from "@/components/ui/use-toast";
import { FeaturedNews } from "@/components/FeaturedNews";

const categories: Record<string, string> = {
  anime: "Anime",
  manga: "Manga",
  bollywood: "Bollywood",
  hollywood: "Hollywood",
  tvshows: "TV Shows",
  comics: "Comics",
  kpop: "K-Pop",
  celebrity: "Celebrity",
  upcoming: "Upcoming",
  trending: "Trending"
};

const Category = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const categoryName = categoryId ? categories[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : "Category";

  useEffect(() => {
    if (!categoryId) return;

    const loadNews = async () => {
      setIsLoading(true);
      try {
        const fetchedArticles = await fetchNewsByCategory(categoryId);
        
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
          setFeaturedArticle(fetchedArticles[0]);
          setArticles(fetchedArticles.slice(1));
        } else {
          setFeaturedArticle(undefined);
          setArticles([]);
        }
      } catch (error) {
        handleNewsError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, [categoryId]);

  const handleRefresh = async () => {
    if (!categoryId) return;
    
    setIsRefreshing(true);
    try {
      const fetchedArticles = await fetchNewsByCategory(categoryId);
      
      if (fetchedArticles.length === 0) {
        setArticles([]);
        setFeaturedArticle(undefined);
        return;
      }
      
      const withImages = fetchedArticles.filter(a => a.urlToImage);
      if (withImages.length > 0) {
        setFeaturedArticle(withImages[0]);
        setArticles(fetchedArticles.filter(a => a.id !== withImages[0].id));
      } else if (fetchedArticles.length > 0) {
        setFeaturedArticle(fetchedArticles[0]);
        setArticles(fetchedArticles.slice(1));
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
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft size={18} />
              <span className="sr-only">Back</span>
            </Button>
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold">
              {categoryName}
            </h2>
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
        </div>
        
        <div className="mt-6">
          <FeaturedNews article={featuredArticle} />
          <NewsGrid 
            articles={articles} 
            isLoading={isLoading} 
            onRefresh={handleRefresh}
            emptyMessage={`No recent ${categoryName.toLowerCase()} news found. Try refreshing or check back later.`}
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

export default Category;
