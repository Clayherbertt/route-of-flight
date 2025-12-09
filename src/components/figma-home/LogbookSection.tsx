import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function LogbookSection() {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      title: 'CSV Import & Export',
      description: 'Seamlessly import from ForeFlight, LogTen Pro, and other platforms'
    },
    {
      title: 'Automatic Currency Tracking',
      description: 'Never miss a currency requirement with automated alerts'
    },
    {
      title: 'Master Flight Log',
      description: 'Comprehensive totals for all flight categories and requirements'
    }
  ];

  const primaryColor = 'rgb(10, 46, 118)';

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
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
              <BookOpen size={16} />
              Smart Logbook
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-slate-900 mb-3 sm:mb-4">
              Your Complete Digital Flight Log
            </h2>

            {/* Description */}
            <p className="text-slate-600 text-base sm:text-lg mb-6 sm:mb-8">
              Consolidate all your flight entries in one place. Import from CSV, track currency automatically, and generate professional reports for airline applications.
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
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Button
                className="w-full sm:w-auto px-6 py-3 text-white shadow-lg text-sm sm:text-base"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: '0 10px 30px rgba(10, 46, 118, 0.3)'
                }}
              >
                Start Your Logbook
                <motion.div
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight size={18} />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - Flight Entry Card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 relative mt-8 lg:mt-0"
              whileHover={{ y: -10, boxShadow: '0 30px 60px rgba(0, 0, 0, 0.15)' }}
              transition={{ duration: 0.3 }}
            >
              {/* Synced Badge */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-slate-900 mb-1">Sample Flight Entry</h3>
                  <p className="text-slate-500 text-sm">Nov 18, 2024 • N842JT</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-700 text-sm">Synced</span>
                </div>
              </div>

              {/* Route */}
              <div className="mb-4 sm:mb-6">
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Route</p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-slate-900 text-xl sm:text-2xl">KDEN</span>
                  <ArrowRight className="text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-slate-900 text-xl sm:text-2xl">KLAX</span>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">Cessna CJ4</p>
              </div>

              {/* Time Details */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Total Time</p>
                  <p className="text-slate-900 text-lg sm:text-xl">2.1 hrs</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">PIC</p>
                  <p className="text-slate-900 text-lg sm:text-xl">1.5 hrs</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Night</p>
                  <p className="text-slate-900 text-lg sm:text-xl">0.4 hrs</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Instrument</p>
                  <p className="text-slate-900 text-lg sm:text-xl">0.7 hrs</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}