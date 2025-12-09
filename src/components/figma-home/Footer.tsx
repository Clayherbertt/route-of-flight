import { motion } from 'framer-motion';

export function Footer() {
  const primaryColor = 'rgb(10, 46, 118)';

  const footerSections = [
    {
      title: 'Route of Flight',
      items: [
        'The professional pilot\'s platform for career',
        'advancement and flight tracking'
      ],
      isDescription: true
    },
    {
      title: 'Product',
      items: [
        'Digital Logbook',
        'Airline Database',
        'Route Builder',
        'Career Analytics'
      ]
    },
    {
      title: 'Resources',
      items: [
        'Blog',
        'Documentation',
        'Flight Training',
        'Career Guides'
      ]
    },
    {
      title: 'Company',
      items: [
        'About',
        'Privacy Policy',
        'Terms of Service',
        'Contact'
      ]
    }
  ];

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        {/* Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10 md:mb-12">
          {footerSections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3
                className="mb-4"
                style={{ color: primaryColor }}
              >
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    {section.isDescription ? (
                      <p className="text-slate-600 text-sm">{item}</p>
                    ) : (
                      <a
                        href="#"
                        className="text-slate-600 text-sm hover:text-slate-900 transition-colors duration-200"
                      >
                        {item}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Copyright */}
        <motion.div
          className="pt-8 border-t border-slate-200 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-slate-500 text-sm">
            © 2024 Route of Flight. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
