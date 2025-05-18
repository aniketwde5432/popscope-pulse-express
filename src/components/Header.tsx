
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Bookmark, User, LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border backdrop-blur-md bg-opacity-90">
      <div className="container py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-primary">
              PopScope <span className="text-foreground">Express</span>
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="animate-fade-in flex items-center">
              <Input
                type="text"
                placeholder="Search news..."
                className="max-w-[200px] focus-visible:ring-primary"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="rounded-full"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          
          <ThemeToggle />
          
          {location.pathname !== '/saved' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hidden md:flex" 
              onClick={() => navigate('/saved')}
            >
              <Bookmark className="h-5 w-5" />
              <span className="sr-only">Saved Articles</span>
            </Button>
          )}
          
          {isAuthenticated ? (
            <div className="hidden md:flex gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate('/profile')}
                className="rounded-full"
              >
                <User className="h-4 w-4 mr-2" />
                {user?.email?.split('@')[0] || 'Profile'}
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="rounded-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button size="sm" className="rounded-full" onClick={() => navigate('/auth')}>
                Create Account
              </Button>
            </div>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="font-playfair text-primary">
                  PopScope <span className="text-foreground">Express</span>
                </SheetTitle>
                <SheetDescription>
                  Your real-time pop culture news platform
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3 py-6">
                <SheetClose asChild>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/')}
                    className="justify-start"
                  >
                    Home
                  </Button>
                </SheetClose>
                
                <SheetClose asChild>
                  <Button 
                    variant="ghost"
                    onClick={() => navigate('/saved')}
                    className="justify-start"
                  >
                    <Bookmark className="h-4 w-4 mr-2" /> Saved Articles
                  </Button>
                </SheetClose>
                
                {isAuthenticated ? (
                  <>
                    <SheetClose asChild>
                      <Button 
                        variant="ghost"
                        onClick={() => navigate('/profile')}
                        className="justify-start"
                      >
                        <User className="h-4 w-4 mr-2" /> Profile
                      </Button>
                    </SheetClose>
                    
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        handleSignOut();
                      }}
                      className="justify-start text-destructive hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Button 
                      variant="default"
                      onClick={() => navigate('/auth')}
                      className="justify-start"
                    >
                      Sign In / Create Account
                    </Button>
                  </SheetClose>
                )}
              </div>
              <SheetFooter className="mt-auto">
                <ThemeToggle />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
