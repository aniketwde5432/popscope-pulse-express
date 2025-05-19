
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export function PaperButton() {
  const [articleCount, setArticleCount] = useState(0);
  const { toast } = useToast();
  
  // Update count whenever localStorage changes
  useEffect(() => {
    const updateCount = () => {
      try {
        const paperArticles = JSON.parse(localStorage.getItem('paperArticles') || '[]');
        setArticleCount(paperArticles.length);
      } catch (error) {
        console.error('Error reading paper articles:', error);
      }
    };
    
    // Initial count
    updateCount();
    
    // Listen for storage events (in case multiple tabs are open)
    window.addEventListener('storage', updateCount);
    
    // Custom event for when we update the paper within the same tab
    window.addEventListener('paperUpdated', updateCount);
    
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('paperUpdated', updateCount);
    };
  }, []);

  return (
    <Button 
      asChild
      variant="outline" 
      size="sm"
      className="rounded-full gap-2 relative"
    >
      <Link to="/paper">
        <Newspaper size={16} />
        <span>My Paper</span>
        {articleCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {articleCount > 9 ? '9+' : articleCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
