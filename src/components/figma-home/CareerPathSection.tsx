import { motion } from 'framer-motion';
import { Compass, CheckCircle2, TrendingUp, FileText, ArrowRight, Target } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CareerPathSection() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const features = [
    {
      icon: Target,
      title: 'Step-by-Step Guidance',
      description: 'Clear roadmap from student pilot to airline captain'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Visual progress indicators and automatic requirement checking'
    },
    {
      icon: FileText,
      title: 'Integrated Flight Log',
      description: 'Route builder automatically checks off completed requirements'
    }
  ];

  const routeSteps = [
    {
      number: 1,
      title: 'Initial Training',
      subtitle: 'Flight school selection & discovery',
      completed: true
    },
    {
      number: 2,
      title: 'Private Pilot License',
      subtitle: '40 hours total time required',
      completed: true
    },
    {
      number: 3,
      title: 'Instrument Rating',
      subtitle: 'In progress • 30-40 hours',
      completed: false
    },
    {
      number: 4,
      title: 'Commercial License',
      subtitle: '250 hours total time required',
      completed: false
    }
  ];

  const primaryColor = 'rgb(10, 46, 118)';

  return (
    <div className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
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
              <Compass size={16} />
              Career Planning
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-slate-900 mb-3 sm:mb-4">
              Build Your Path to the Flight Deck
            </h2>

            {/* Description */}
            <p className="text-slate-600 text-base sm:text-lg mb-6 sm:mb-8">
              Follow a step-by-step route from initial training through airline certification. Track your progress, meet requirements, and stay on course to achieve your aviation career goals.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
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
                );
              })}
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
                Start Building Your Route
                <motion.div
                  animate={{ x: isButtonHovered ? 5 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight size={18} />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - Route Builder Card */}
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
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-900 text-xl">Route Builder</h3>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(10, 46, 118, 0.1)' }}
                >
                  <Target size={20} style={{ color: primaryColor }} />
                </div>
              </div>

              {/* Route Steps */}
              <div className="space-y-4">
                {routeSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {/* Step Number */}
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{
                        backgroundColor: step.completed ? 'rgba(10, 46, 118, 0.1)' : '#f1f5f9',
                        color: step.completed ? primaryColor : '#64748b'
                      }}
                    >
                      {step.number}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-900 mb-0.5 text-sm sm:text-base">{step.title}</h4>
                      <p className="text-slate-500 text-xs sm:text-sm">{step.subtitle}</p>
                    </div>

                    {/* Status Indicator */}
                    {step.completed ? (
                      <CheckCircle2
                        size={24}
                        className="flex-shrink-0"
                        style={{ color: '#22c55e' }}
                      />
                    ) : (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-slate-300" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

