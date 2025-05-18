
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-playfair font-bold text-primary">404</h1>
        <h2 className="text-2xl font-playfair font-semibold mb-4">Breaking News: Page Not Found!</h2>
        <p className="text-muted-foreground mb-8">
          The article you're looking for seems to have been moved or never existed. Our reporters are on the case!
        </p>
        <Button asChild size="lg" className="rounded-full">
          <a href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Headlines
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
