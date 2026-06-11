'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  /** Animation duration in ms (default: 150) */
  duration?: number;
}

/**
 * Wraps page content with a subtle fade-in animation on route change.
 * Uses framer-motion AnimatePresence with very fast animation (150ms)
 * to avoid perceived slowness. Only fades opacity — no layout shifts.
 *
 * Usage:
 *   <PageTransition>{children}</PageTransition>
 */
export function PageTransition({ children, duration = 150 }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration / 1000, ease: 'easeInOut' }}
        style={{ willChange: 'opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
