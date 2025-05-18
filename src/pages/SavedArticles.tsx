
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { NewsGrid } from "@/components/NewsGrid";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getSavedArticles, type NewsArticle } from "@/services/newsService";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const SavedArticles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view your saved articles",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }
      
      setUserId(session.user.id);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setUserId(session.user.id);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Load saved articles
  useEffect(() => {
    if (!userId) return;
    
    const loadSavedArticles = async () => {
      setIsLoading(true);
      try {
        const savedArticles = await getSavedArticles(userId);
        setArticles(savedArticles);
      } catch (error) {
        console.error("Error loading saved articles:", error);
        toast({
          title: "Failed to load saved articles",
          description: "Could not retrieve your saved articles. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedArticles();
  }, [userId, toast]);

  const handleRefresh = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const savedArticles = await getSavedArticles(userId);
      setArticles(savedArticles);
      toast({
        title: "Saved articles refreshed",
        description: "Your collection has been updated",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error refreshing saved articles:", error);
      toast({
        title: "Failed to refresh articles",
        description: "Could not update your saved articles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container pt-6 pb-12">
        <div className="flex items-center gap-3 mb-6">
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
            Saved Articles
          </h2>
        </div>
        
        <div className="mt-6">
          <NewsGrid 
            articles={articles} 
            isLoading={isLoading} 
            onRefresh={handleRefresh}
            emptyMessage="You haven't saved any articles yet. Browse categories and save articles you like."
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

export default SavedArticles;
