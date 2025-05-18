
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { saveArticle, unsaveArticle, isArticleSaved } from "@/services/newsService";
import type { NewsArticle } from "@/services/newsService";

interface SaveButtonProps {
  article: NewsArticle;
  size?: "sm" | "default";
  variant?: "ghost" | "outline" | "default";
}

export function SaveButton({ article, size = "sm", variant = "ghost" }: SaveButtonProps) {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      
      if (session?.user?.id) {
        const saved = await isArticleSaved(session.user.id, article.id);
        setIsSaved(saved);
      }
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUserId(session?.user?.id || null);
      if (session?.user?.id) {
        const saved = await isArticleSaved(session.user.id, article.id);
        setIsSaved(saved);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [article.id]);

  const handleToggleSave = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save articles",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSaved) {
        const success = await unsaveArticle(userId, article.id);
        if (success) {
          setIsSaved(false);
          toast({
            title: "Removed from saved articles",
            description: "Article has been removed from your saved items",
          });
        }
      } else {
        const success = await saveArticle(userId, article);
        if (success) {
          setIsSaved(true);
          toast({
            title: "Added to saved articles",
            description: "Article has been saved to your collection",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast({
        title: "Something went wrong",
        description: "Could not update saved articles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggleSave();
      }}
      disabled={isLoading}
      className={`hover:text-secondary ${isSaved ? "text-secondary" : ""}`}
    >
      {isSaved ? (
        <BookmarkCheck size={18} className="fill-current" />
      ) : (
        <BookmarkPlus size={18} />
      )}
      <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
    </Button>
  );
}
