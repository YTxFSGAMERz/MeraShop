'use client';

import { motion } from 'framer-motion';
import { Truck, ShieldCheck, RotateCcw, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const badges = [
  {
    icon: Truck,
    title: 'Free Delivery',
    subtitle: 'On orders above ₹499',
    gradientFrom: '#22c55e',
    gradientTo: '#16a34a',
    bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
  },
  {
    icon: ShieldCheck,
    title: 'Genuine Products',
    subtitle: '100% authentic items',
    gradientFrom: '#3b82f6',
    gradientTo: '#2563eb',
    bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    subtitle: '7-day return policy',
    gradientFrom: '#f59e0b',
    gradientTo: '#d97706',
    bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    subtitle: 'UPI, Cards & more',
    gradientFrom: '#8b5cf6',
    gradientTo: '#7c3aed',
    bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20',
  },
];

const badgeVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};

export function TrustBadges() {
  return (
    <section className="section-padding border-y border-border/50 bg-background">
      <div className="container-shop">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                custom={i}
                variants={badgeVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className={cn(
                  'flex items-center gap-3 p-3 md:p-4 rounded-xl bg-gradient-to-br transition-all duration-300 cursor-default hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 glass',
                  badge.bgGradient
                )}
              >
                <motion.div
                  className="flex size-11 md:size-12 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})` }}
                  suppressHydrationWarning
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Icon className="size-5 md:size-6" />
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {badge.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {badge.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
