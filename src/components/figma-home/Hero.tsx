import { motion } from 'framer-motion';
import { BookOpen, Database, Route, ChevronRight, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function Hero() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Digital Logbook',
      description: 'Track your flight hours and flight routes across airlines'
    },
    {
      icon: Database,
      title: 'Airline Database',
      description: 'Access comprehensive data on thousands of airlines worldwide'
    },
    {
      icon: Route,
      title: 'Route Builder',
      description: 'Plan and design your own custom flight routes to airline hubs'
    }
  ];

  const primaryColor = 'rgb(10, 46, 118)';
  const primaryColor70 = 'rgba(10, 46, 118, 0.7)';

  return (
    <div className="relative overflow-hidden">
      {/* Simplified Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-0 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 rounded-full mix-blend-multiply filter blur-xl opacity-40"
          style={{ backgroundColor: primaryColor70 }}
        />
        <div
          className="absolute top-40 right-0 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          style={{ backgroundColor: 'rgba(10, 46, 118, 0.5)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16 md:pb-24">
        {/* Badge */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border"
            style={{ 
              backgroundColor: 'rgba(10, 46, 118, 0.05)',
              color: primaryColor,
              borderColor: 'rgba(10, 46, 118, 0.2)'
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primaryColor70 }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: primaryColor }}></span>
            </span>
            Professional Pilot Platform
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          className="text-center mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-slate-900 mb-4 sm:mb-6 px-2">
            Navigate Your
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${primaryColor70})`
              }}
            >
              Aviation Career
            </span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-center text-slate-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          The complete digital logbook and career platform for professional pilots. Track hours, maintain currency, and build a roadmap to your dream airline.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 md:mb-20 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {!user && (
            <motion.div
              className="w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/signin">
                <Button
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-white shadow-lg text-sm sm:text-base"
                  style={{ 
                    backgroundColor: primaryColor,
                    boxShadow: `0 10px 30px ${primaryColor70}`
                  }}
                >
                  Get Started Free
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </motion.div>
          )}

          <motion.div
            className="w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/subscription">
              <Button
                variant="outline"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-700 border-2 text-sm sm:text-base"
                style={{
                  borderColor: 'rgba(10, 46, 118, 0.2)'
                }}
              >
                Plan/Pricing
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="relative group"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <motion.div
                  className="relative bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full transition-all duration-300"
                  whileHover={{ 
                    y: -8,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  {/* Animated gradient background on hover */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(to bottom right, rgba(10, 46, 118, 0.05), rgba(10, 46, 118, 0.1))`,
                      opacity: hoveredCard === index ? 1 : 0
                    }}
                  />

                  <div className="relative">
                    {/* Icon Container */}
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl mb-3 sm:mb-4"
                      style={{ backgroundColor: 'rgba(10, 46, 118, 0.1)' }}
                    >
                      <Icon style={{ color: primaryColor }} className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    {/* Title */}
                    <h3 className="text-slate-900 mb-2 text-base sm:text-lg">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Animated underline indicator */}
                    <div
                      className="h-1 rounded-full mt-4 transition-all duration-300"
                      style={{
                        background: `linear-gradient(to right, ${primaryColor}, ${primaryColor70})`,
                        width: hoveredCard === index ? "100%" : "0%"
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}