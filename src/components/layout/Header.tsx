import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";
import { useState, useEffect } from "react";
import logo from "@/assets/ROF-logo-final-03.png";

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
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
      <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between pl-2 pr-3 sm:pl-4 sm:pr-4 md:pl-6 md:pr-6 gap-2">
        <div className="flex items-center flex-shrink min-w-0 overflow-hidden">
          <Link 
            to="/" 
            className="group transition-all duration-300"
          >
            <img 
              src={logo} 
              alt="Route of Flight" 
              className={`h-8 sm:h-10 md:h-12 w-auto object-contain transition-all duration-300 group-hover:opacity-80 group-hover:scale-105 ${
                isScrolled ? 'h-7 sm:h-8 md:h-10' : 'h-8 sm:h-10 md:h-12'
              }`}
            />
          </Link>
        </div>

        <div className="flex items-center flex-shrink-0 gap-1 sm:gap-2">
          {loading ? (
            <div className="w-8 h-8 animate-pulse bg-muted rounded-full" />
          ) : user ? (
            <UserMenu />
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
              <Link to="/signin">
                <Button variant="default" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  Sign Up
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