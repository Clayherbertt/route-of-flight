import { Button } from "@/components/ui/button";
import { Plane, Book, Building2, FileText, Route } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";
import { useState, useEffect } from "react";
import logo from "@/assets/Transparent ROF Only .png";

const Header = () => {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link 
            to="/" 
            className="flex items-center space-x-2 group transition-all duration-300"
          >
            <img 
              src={logo} 
              alt="Route of Flight" 
              className={`h-9 w-auto object-contain transition-all duration-300 group-hover:opacity-80 group-hover:scale-105 ${
                isScrolled ? 'h-7' : 'h-9'
              }`}
            />
            <h1 className="text-xl font-bold text-foreground">Route of Flight</h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/logbook"
            className="text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition"
          >
            <Book className="inline h-4 w-4 mr-2" />
            Logbook
          </Link>
          <Link
            to="/airlines"
            className="text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition"
          >
            <Building2 className="inline h-4 w-4 mr-2" />
            Airlines
          </Link>
          <Link
            to="/route"
            className="text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition"
          >
            <Route className="inline h-4 w-4 mr-2" />
            Route
          </Link>
          <Link
            to="/resume"
            className="text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition"
          >
            <FileText className="inline h-4 w-4 mr-2" />
            Resume
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="w-8 h-8 animate-pulse bg-muted rounded-full" />
          ) : user ? (
            <UserMenu />
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signin">
                <Button variant="default" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;