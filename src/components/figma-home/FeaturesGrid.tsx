import { motion } from 'framer-motion';
import { Upload, BarChart3, Shield, Zap, Globe, FileText } from 'lucide-react';
import { useState } from 'react';

export function FeaturesGrid() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Upload,
      title: 'Easy Import',
      description: 'Import from any CSV format in seconds'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track progress with detailed statistics'
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Your data is encrypted and secure'
    },
    {
      icon: Zap,
      title: 'Fast',
      description: 'Lightning-fast performance'
    },
    {
      icon: Globe,
      title: 'Cloud Sync',
      description: 'Access your logbook anywhere'
    },
    {
      icon: FileText,
      title: 'Reports',
      description: 'Generate professional reports'
    }
  ];

  const primaryColor = 'rgb(10, 46, 118)';

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-slate-900 mb-3 sm:mb-4 px-4">
            Everything You Need to Advance Your Career
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Professional tools designed specifically for pilots
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div
                  className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 h-full"
                  style={{
                    transform: hoveredFeature === index ? 'translateY(-4px)' : 'translateY(0)'
                  }}
                >
                  {/* Icon Container */}
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300"
                    style={{
                      backgroundColor: hoveredFeature === index
                        ? 'rgba(10, 46, 118, 0.15)'
                        : 'rgba(10, 46, 118, 0.08)'
                    }}
                  >
                    <Icon
                      size={24}
                      className="sm:w-7 sm:h-7"
                      style={{ color: primaryColor }}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-slate-900 mb-2 text-base sm:text-lg">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 text-xs sm:text-sm">
                    {feature.description}
                  </p>

                  {/* Bottom accent line */}
                  <div
                    className="h-1 rounded-full mt-6 transition-all duration-300"
                    style={{
                      backgroundColor: primaryColor,
                      width: hoveredFeature === index ? '100%' : '0%'
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
