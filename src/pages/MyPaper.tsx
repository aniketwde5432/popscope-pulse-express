
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Newspaper } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { type NewsArticle } from "@/services/newsService";
import { ShareNewspaper } from "@/components/ShareNewspaper";

const PAPER_TITLE_OPTIONS = [
  "The Daily Digest",
  "Pop Culture Chronicle",
  "Anime Gazette",
  "Entertainment Times",
  "The K-Print",
  "Celebrity Observer",
  "Otaku Digest",
  "Hollywood Herald",
  "Manga Monitor",
  "Trend Tribune"
];

const MyPaper = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticles, setSelectedArticles] = useState<NewsArticle[]>([]);
  const [paperTitle, setPaperTitle] = useState(PAPER_TITLE_OPTIONS[0]);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create your newspaper",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }
      
      setUserId(session.user.id);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (session?.user) {
        setUserId(session.user.id);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Load articles from localStorage
  useEffect(() => {
    const loadArticles = () => {
      setIsLoading(true);
      try {
        // Get articles from localStorage
        const paperArticles = JSON.parse(localStorage.getItem('paperArticles') || '[]');
        setSelectedArticles(paperArticles);
      } catch (error) {
        console.error("Error loading paper articles:", error);
        toast({
          title: "Failed to load articles",
          description: "Could not retrieve your selected articles",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial load
    loadArticles();
    
    // Listen for paper updates
    const handlePaperUpdate = () => {
      loadArticles();
    };
    
    window.addEventListener('paperUpdated', handlePaperUpdate);
    window.addEventListener('storage', handlePaperUpdate);
    
    return () => {
      window.removeEventListener('paperUpdated', handlePaperUpdate);
      window.removeEventListener('storage', handlePaperUpdate);
    };
  }, [toast]);

  // Remove an article from selection
  const handleRemoveArticle = (articleId: string) => {
    const updatedArticles = selectedArticles.filter(article => article.id !== articleId);
    setSelectedArticles(updatedArticles);
    localStorage.setItem('paperArticles', JSON.stringify(updatedArticles));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('paperUpdated'));
    
    toast({
      title: "Article removed",
      description: "Article removed from your paper",
    });
  };

  // Clear all selected articles
  const handleClearAll = () => {
    setSelectedArticles([]);
    localStorage.setItem('paperArticles', JSON.stringify([]));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('paperUpdated'));
    
    toast({
      title: "Selection cleared",
      description: "All articles have been removed from your paper",
    });
  };

  // Generate a random paper title
  const handleRandomTitle = () => {
    const randomIndex = Math.floor(Math.random() * PAPER_TITLE_OPTIONS.length);
    setPaperTitle(PAPER_TITLE_OPTIONS[randomIndex]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container pt-6 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
              Share Your Headlines
            </h2>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedArticles.length === 0}
              className="rounded-full gap-2"
            >
              <Trash2 size={16} />
              Clear All
            </Button>
          </div>
        </div>
        
        <div className="bg-vintage-beige/30 p-6 rounded-lg shadow-sm border border-muted mt-6">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="flex-1">
              <h3 className="font-playfair text-xl font-bold mb-2">Your Newspaper</h3>
              <p className="text-muted-foreground">
                Create a shareable newspaper-style digest from your saved articles.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <select
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  className="w-full md:w-auto rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10"
                >
                  {PAPER_TITLE_OPTIONS.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0" 
                  onClick={handleRandomTitle}
                >
                  🎲
                </Button>
              </div>
              
              <ShareNewspaper 
                articles={selectedArticles} 
                onRemoveArticle={handleRemoveArticle} 
                paperTitle={paperTitle} 
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <Newspaper className="animate-pulse h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4">Loading your saved articles...</p>
            </div>
          ) : selectedArticles.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedArticles.map(article => (
                <div 
                  key={article.id} 
                  className="border rounded-md p-4 bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {article.urlToImage && (
                      <img 
                        src={article.urlToImage} 
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "https://images.unsplash.com/photo-1497005367839-6e852de72767?q=80&w=1167&auto=format&fit=crop";
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold line-clamp-2 text-sm">{article.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{article.source.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveArticle(article.id)}
                      className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed rounded-md">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Articles Selected</h3>
              <p className="text-muted-foreground mt-1">
                Save articles from categories to build your newspaper.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/")} 
                className="mt-4 rounded-full"
              >
                Browse News
              </Button>
            </div>
          )}
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

export default MyPaper;
