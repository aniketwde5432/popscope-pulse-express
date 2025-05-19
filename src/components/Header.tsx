
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Menu, X, User, BookmarkCheck } from "lucide-react";
import { CategoryNav } from "@/components/CategoryNav"; 
import { supabase } from "@/integrations/supabase/client";
import { PaperButton } from "@/components/PaperButton";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      setIsAuthenticated(event !== "SIGNED_OUT");
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Close the mobile menu when route changes
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="md:hidden"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <Link to="/" className="flex items-center gap-1">
            <span className="text-xl font-playfair font-bold text-primary">
              PopScope <span className="text-foreground">Express</span>
            </span>
          </Link>
        </div>
        
        <nav className={`absolute left-0 right-0 top-16 p-4 border-b md:static md:p-0 md:border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:bg-transparent ${isMenuOpen ? "block" : "hidden md:block"}`}>
          <div className="container md:p-0">
            <ul className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <li className="md:hidden">
                <Link to="/" className="font-medium hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              
              <li className="flex overflow-auto pb-2 md:pb-0 md:overflow-visible">
                <CategoryNav />
              </li>
            </ul>
          </div>
        </nav>
        
        <div className="flex items-center gap-2">
          <PaperButton />
          
          <div className="hidden xs:flex">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-2"
                asChild
              >
                <Link to="/saved">
                  <BookmarkCheck size={16} />
                  <span>Saved</span>
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-2"
                onClick={() => navigate("/auth")}
              >
                <User size={16} />
                <span>Sign In</span>
              </Button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
          >
            <Search size={18} />
            <span className="sr-only">Search</span>
          </Button>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
