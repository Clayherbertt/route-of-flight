import { motion } from 'framer-motion';
import { Lightbulb, Search, ArrowRight, Plane } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function AirlineSection() {
  const [hoveredAirline, setHoveredAirline] = useState<number | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const airlines = [
    { name: 'Delta Air Lines', location: 'Major • Atlanta, GA' },
    { name: 'United Airlines', location: 'Major • Chicago, IL' },
    { name: 'SkyWest Airlines', location: 'Regional • St. George, UT' }
  ];

  const features = [
    {
      title: 'Hiring Requirements',
      description: 'Up-to-date minimums for total time, PIC, and type ratings'
    },
    {
      title: 'Fleet Information',
      description: 'Complete aircraft fleet data and route networks'
    },
    {
      title: 'Career Paths',
      description: 'Understand progression from regional to major carriers'
    }
  ];

  const primaryColor = 'rgb(10, 46, 118)';

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left Content - Airline Database Card */}
          <motion.div
            className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 relative mt-8 lg:mt-0"
              whileHover={{ y: -10, boxShadow: '0 30px 60px rgba(0, 0, 0, 0.15)' }}
              transition={{ duration: 0.3 }}
            >
              {/* Search Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Search className="text-slate-400" size={20} />
                  <span className="text-slate-600">Airline Database</span>
                </div>
              </div>

              {/* Airline List */}
              <div className="space-y-3 mb-6">
                {airlines.map((airline, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer transition-all"
                    style={{
                      backgroundColor: hoveredAirline === index ? 'rgba(10, 46, 118, 0.02)' : 'white'
                    }}
                    onMouseEnter={() => setHoveredAirline(index)}
                    onMouseLeave={() => setHoveredAirline(null)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      {/* Airline Icon */}
                      <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(10, 46, 118, 0.1)' }}
                      >
                        <Plane className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: primaryColor }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-slate-900 text-sm sm:text-base truncate">{airline.name}</h4>
                        <p className="text-slate-500 text-xs sm:text-sm truncate">{airline.location}</p>
                      </div>
                    </div>
                    <ArrowRight className="text-slate-400 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                ))}
              </div>

              {/* Footer note */}
              <p className="text-center text-slate-500 text-sm">
                + 50+ airlines with detailed hiring requirements
              </p>
            </motion.div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-6"
              style={{
                backgroundColor: 'rgba(10, 46, 118, 0.1)',
                color: primaryColor
              }}
            >
              <Lightbulb size={16} />
              Airline Intelligence
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-slate-900 mb-3 sm:mb-4">
              Find Your Dream Airline
            </h2>

            {/* Description */}
            <p className="text-slate-600 text-base sm:text-lg mb-6 sm:mb-8">
              Access comprehensive data on hiring minimums, fleet information, base locations, and career progression paths for major and regional airlines.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5"
                    style={{ borderColor: primaryColor }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                  <div>
                    <h3 className="text-slate-900 mb-1">{feature.title}</h3>
                    <p className="text-slate-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
            >
              <Button
                className="w-full sm:w-auto px-6 py-3 text-white shadow-lg text-sm sm:text-base"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: '0 10px 30px rgba(10, 46, 118, 0.3)'
                }}
              >
                Explore Database
                <motion.div
                  animate={{ x: isButtonHovered ? 5 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight size={18} />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}