import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Book, 
  Building2, 
  Compass, 
  TrendingUp, 
  Upload,
  Search,
  Target,
  CheckCircle2,
  Clock,
  Plane,
  BarChart3,
  Users,
  FileText,
  Zap,
  Shield,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(user ? "/logbook" : "/signin");
  };

  const handleViewAirlines = () => {
    navigate("/airlines");
  };

  const handleViewRoute = () => {
    navigate("/route");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 pt-20 pb-32">
        {/* Enhanced background effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="px-4 py-1.5 text-sm border-primary/20 bg-primary/5 backdrop-blur-sm">
                <Plane className="h-3.5 w-3.5 mr-2" />
                Professional Pilot Platform
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Navigate Your
              <motion.span 
                className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mt-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Aviation Career
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              The complete digital logbook and career platform for professional pilots. 
              Track hours, maintain currency, and build a roadmap to your dream airline.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button 
                size="lg" 
                className="px-8 text-base h-12 shadow-lg hover:shadow-xl transition-shadow" 
                onClick={handleGetStarted}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 text-base h-12 border-2 hover:bg-primary/5 transition-colors" 
                onClick={handleViewAirlines}
              >
                Explore Airlines
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="border-2 hover:border-primary/50 transition-all shadow-md hover:shadow-xl bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 shadow-sm">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Digital Logbook</CardTitle>
                <CardDescription>
                  Import, edit, and manage your flight entries with ease
                </CardDescription>
              </CardHeader>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="border-2 hover:border-primary/50 transition-all shadow-md hover:shadow-xl bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 shadow-sm">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Airline Database</CardTitle>
                  <CardDescription>
                    Comprehensive data on hiring requirements and fleet information
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="border-2 hover:border-primary/50 transition-all shadow-md hover:shadow-xl bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 shadow-sm">
                    <Compass className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Route Builder</CardTitle>
                  <CardDescription>
                    Step-by-step guide from zero hours to airline pilot
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Digital Logbook Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5">
                <Book className="h-3.5 w-3.5 mr-2" />
                Smart Logbook
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Your Complete Digital Flight Log
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Consolidate all your flight entries in one place. Import from CSV, 
                track currency automatically, and generate professional reports for 
                airline applications.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">CSV Import & Export</p>
                    <p className="text-sm text-muted-foreground">
                      Seamlessly import from ForeFlight, LogTen Pro, and other platforms
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Automatic Currency Tracking</p>
                    <p className="text-sm text-muted-foreground">
                      Never miss a currency requirement with automated alerts
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Master Flight Log</p>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive totals for all flight categories and requirements
                    </p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="mt-6" onClick={handleGetStarted}>
                Start Your Logbook
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-2 shadow-2xl">
                <CardHeader className="border-b bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Sample Flight Entry</CardTitle>
                      <CardDescription>Nov 18, 2024 • N482JF</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Synced
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Route</p>
                      <p className="font-semibold">KDEN → KLAX</p>
                      <p className="text-sm text-muted-foreground">Cessna CJ4</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Time</p>
                        <p className="text-lg font-semibold">2.1 hrs</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">PIC</p>
                        <p className="text-lg font-semibold">1.5 hrs</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Night</p>
                        <p className="text-lg font-semibold">0.4 hrs</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Instrument</p>
                        <p className="text-lg font-semibold">0.7 hrs</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Airline Database Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div 
              className="relative order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-2 shadow-2xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
                <CardHeader className="border-b bg-muted/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Airline Database</CardTitle>
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Plane className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Delta Air Lines</p>
                          <p className="text-sm text-muted-foreground">Major • Atlanta, GA</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Plane className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">United Airlines</p>
                          <p className="text-sm text-muted-foreground">Major • Chicago, IL</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Plane className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">SkyWest Airlines</p>
                          <p className="text-sm text-muted-foreground">Regional • St. George, UT</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground text-center">
                        + 50+ airlines with detailed hiring requirements
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              className="space-y-6 order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5">
                <Building2 className="h-3.5 w-3.5 mr-2" />
                Airline Intelligence
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Find Your Dream Airline
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Access comprehensive data on hiring minimums, fleet information, 
                base locations, and career progression paths for major and regional airlines.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Hiring Requirements</p>
                    <p className="text-sm text-muted-foreground">
                      Up-to-date minimums for total time, PIC, and type ratings
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Fleet Information</p>
                    <p className="text-sm text-muted-foreground">
                      Complete aircraft fleet data and route networks
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Career Paths</p>
                    <p className="text-sm text-muted-foreground">
                      Understand progression from regional to major carriers
                    </p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="mt-6" onClick={handleViewAirlines}>
                Explore Database
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Route Builder Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5">
                <Compass className="h-3.5 w-3.5 mr-2" />
                Career Planning
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Build Your Path to the Flight Deck
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Follow a step-by-step route from initial training through airline 
                certification. Track your progress, meet requirements, and stay on 
                course to achieve your aviation career goals.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Step-by-Step Guidance</p>
                    <p className="text-sm text-muted-foreground">
                      Clear roadmap from student pilot to airline captain
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Progress Tracking</p>
                    <p className="text-sm text-muted-foreground">
                      Visual progress indicators and automatic requirement checking
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Integrated Flight Log</p>
                    <p className="text-sm text-muted-foreground">
                      Route builder automatically checks off completed requirements
                    </p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="mt-6" onClick={handleViewRoute}>
                Start Building Your Route
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-2 shadow-2xl bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
                <CardHeader className="border-b bg-muted/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Route Builder</CardTitle>
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">1</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Initial Training</p>
                          <p className="text-xs text-muted-foreground">Flight school selection & discovery</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">2</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Private Pilot License</p>
                          <p className="text-xs text-muted-foreground">40 hours total time required</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">3</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Instrument Rating</p>
                          <p className="text-xs text-muted-foreground">In progress - 35/40 hours</p>
                        </div>
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground"></div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">4</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Commercial License</p>
                          <p className="text-xs text-muted-foreground">250 hours total time required</p>
                        </div>
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything You Need to Advance Your Career
              </h2>
              <p className="text-xl text-muted-foreground">
                Professional tools designed specifically for pilots
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="border-2 shadow-md hover:shadow-xl bg-gradient-to-br from-card to-card/50 transition-all">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto shadow-sm">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Easy Import</CardTitle>
                  <CardDescription>
                    Import from any CSV format in seconds
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="border-2 shadow-md hover:shadow-xl bg-gradient-to-br from-card to-card/50 transition-all">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto shadow-sm">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Analytics</CardTitle>
                    <CardDescription>
                      Track progress with detailed statistics
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="border-2 shadow-md hover:shadow-xl bg-gradient-to-br from-card to-card/50 transition-all">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto shadow-sm">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Secure</CardTitle>
                    <CardDescription>
                      Your data is encrypted and secure
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="border-2 shadow-md hover:shadow-xl bg-gradient-to-br from-card to-card/50 transition-all">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto shadow-sm">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                  <CardTitle className="text-lg">Fast</CardTitle>
                  <CardDescription>
                    Lightning-fast performance
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="border-2 shadow-md hover:shadow-xl bg-gradient-to-br from-card to-card/50 transition-all">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto shadow-sm">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Cloud Sync</CardTitle>
                    <CardDescription>
                      Access your logbook anywhere
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="border-2 shadow-md hover:shadow-xl bg-gradient-to-br from-card to-card/50 transition-all">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto shadow-sm">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                  <CardTitle className="text-lg">Reports</CardTitle>
                  <CardDescription>
                    Generate professional reports
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Take Control of Your Career?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of pilots using Route of Flight to advance their aviation careers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="px-8 text-base h-12" onClick={handleGetStarted}>
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 text-base h-12" onClick={handleViewAirlines}>
                Explore Features
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Route of Flight</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The professional pilot's platform for career advancement and flight tracking.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Digital Logbook</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Airline Database</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Route Builder</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Career Analytics</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Flight Training</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Career Guides</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border text-center text-muted-foreground text-sm">
            <p>&copy; 2024 Route of Flight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
