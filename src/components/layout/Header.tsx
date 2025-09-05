import { Button } from "@/components/ui/button";
import { Plane, Book, Building2, FileText, Crown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";

const Header = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Plane className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Route of Flight</h1>
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
          {user && location.pathname === '/profile' && (
            <Link
              to="/subscription"
              className="text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition"
            >
              <Crown className="inline h-4 w-4 mr-2" />
              Subscription
            </Link>
          )}
          <a
            href="#resume"
            className="text-sm font-medium text-muted-foreground hover:text-foreground smooth-transition"
          >
            <FileText className="inline h-4 w-4 mr-2" />
            Resume Review
          </a>
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