
import { NewsCard } from "./NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { NewsArticle } from "@/services/newsService";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface NewsGridProps {
  articles: NewsArticle[];
  isLoading: boolean;
  emptyMessage?: string;
  onRefresh?: () => void;
}

export function NewsGrid({ articles, isLoading, emptyMessage, onRefresh }: NewsGridProps) {
  const [page, setPage] = useState(1);
  const articlesPerPage = 12;
  
  // Reset pagination when articles change
  useEffect(() => {
    setPage(1);
  }, [articles]);
  
  // Calculate paginated articles
  const displayedArticles = articles.slice(0, page * articlesPerPage);
  const hasMoreArticles = articles.length > displayedArticles.length;

  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="news-card">
                <div className="relative aspect-video w-full bg-muted/50 overflow-hidden">
                  <Skeleton className="absolute inset-0" />
                </div>
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-10 animate-scale-in">
        <h3 className="text-xl font-playfair mb-2">No articles found</h3>
        <p className="text-muted-foreground">
          {emptyMessage || "We couldn't find any articles in this category. Please check back later."}
        </p>
        {onRefresh && (
          <Button 
            variant="outline" 
            onClick={onRefresh} 
            className="mt-4 rounded-full"
          >
            <RefreshCw size={16} className="mr-2" />
            Try refreshing
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-8">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="rounded-full"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh Content
          </Button>
        )}
        
        {hasMoreArticles && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setPage(page + 1)}
            className="rounded-full px-6 ml-auto"
          >
            Load more articles
          </Button>
        )}
      </div>
    </div>
  );
}
