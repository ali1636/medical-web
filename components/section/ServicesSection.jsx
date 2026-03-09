// components/sections/ServicesSection.jsx
'use client';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { ServiceIcon } from '@/components/ui/ServiceIcon';
import { SERVICES, SERVICE_COLORS } from '@/lib/constants';
import { spring, gentleSpring, stagger, fadeUp } from '@/lib/animations';

export function ServicesSection({ onBook }) {
  return (
    <section id="services" className="py-24 sm:py-32 bg-slate-50/60 dark:bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <span className="text-sm font-semibold text-primary tracking-widest uppercase">Our Services</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Comprehensive Care
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            From routine checkups to specialized treatment — all under one roof.
          </p>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {SERVICES.map((service, index) => {
            const c = SERVICE_COLORS[service.color] || SERVICE_COLORS.blue;
            return (
              <motion.div key={index} variants={fadeUp}>
                <motion.div
                  className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col overflow-hidden cursor-default"
                  whileHover={{ y: -6 }}
                  transition={gentleSpring}
                >
                  {/* Hover background */}
                  <div className={`absolute inset-0 ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <motion.div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${c.icon} ${c.hover}`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={spring}
                      >
                        <ServiceIcon type={service.icon} className="h-6 w-6" />
                      </motion.div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.badge}`}>
                        {service.duration}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{service.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-foreground">{service.price}</span>
                      <motion.button
                        onClick={onBook}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all duration-200"
                        whileHover={{ x: 3 }}
                        transition={spring}
                      >
                        Book Now <ChevronRight className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default ServicesSection;