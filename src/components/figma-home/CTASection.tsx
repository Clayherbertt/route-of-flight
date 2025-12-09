import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  const [isPrimaryHovered, setIsPrimaryHovered] = useState(false);
  const [isSecondaryHovered, setIsSecondaryHovered] = useState(false);

  const primaryColor = 'rgb(10, 46, 118)';
  const primaryColor70 = 'rgba(10, 46, 118, 0.7)';

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto text-center px-4">
        {/* Sparkle Icon */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(10, 46, 118, 0.1)' }}
          >
            <Sparkles size={24} style={{ color: primaryColor }} />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-3 sm:mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Ready to Take Control of Your Career?
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-slate-600 text-base sm:text-lg mb-6 sm:mb-8 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join thousands of pilots using Route of Flight to advance their aviation careers
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            className="w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setIsPrimaryHovered(true)}
            onMouseLeave={() => setIsPrimaryHovered(false)}
          >
            <Button
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-white shadow-lg text-sm sm:text-base"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 10px 30px ${primaryColor70}`
              }}
            >
              Get Started Free
              <motion.div
                animate={{ x: isPrimaryHovered ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
            </Button>
          </motion.div>

          <motion.div
            className="w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setIsSecondaryHovered(true)}
            onMouseLeave={() => setIsSecondaryHovered(false)}
          >
            <Button
              variant="outline"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-700 border-2 hover:bg-slate-50 text-sm sm:text-base"
              style={{
                borderColor: 'rgba(10, 46, 118, 0.2)'
              }}
            >
              Explore Features
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

