'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Still show success state for better UX
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-padding relative overflow-hidden" suppressHydrationWarning>
      {/* Rich saffron to deep orange gradient background */}
      <div className="absolute inset-0 bg-newsletter" />
      <div className="absolute inset-0 hidden dark:block bg-newsletter" />

      {/* Indian pattern overlay */}
      <div className="absolute inset-0 indian-pattern-overlay opacity-30" />

      {/* Shimmer overlay */}
      <div className="absolute inset-0 animate-shimmer opacity-20 bg-shimmer-overlay-newsletter" />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 bg-radial-gold animate-float-6" />
        <div className="absolute bottom-0 -left-8 w-40 h-40 rounded-full opacity-8 bg-radial-gold animate-float-slow-8" />
        <div className="absolute top-1/4 right-1/5 w-2 h-2 rounded-full bg-yellow-300/20 animate-float-4" />
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-200/20 animate-float-slow-5" />
      </div>

      <div className="container-shop relative">
        <div className="max-w-xl mx-auto text-center">
          <AnimatePresence mode="wait">
            {submitted ? (
              /* Success State with checkmark animation */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <motion.div
                  className="size-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                  >
                    <CheckCircle className="size-7 text-white" />
                  </motion.div>
                </motion.div>
                <motion.h3
                  className="text-xl md:text-2xl font-bold text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  You&apos;re in! 🎉
                </motion.h3>
                <motion.p
                  className="text-white/80 text-sm md:text-base"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Check your inbox for the ₹200 discount code. Happy shopping!
                </motion.p>
              </motion.div>
            ) : (
              /* Signup State */
              <motion.div
                key="signup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <Gift className="size-4" />
                  <span className="text-sm font-medium">Exclusive Offer</span>
                </motion.div>
                <motion.h2
                  className="text-2xl md:text-3xl font-bold text-white mb-2"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  Get ₹200 Off Your First Order!
                </motion.h2>
                <motion.p
                  className="text-white/80 text-sm md:text-base mb-6"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  Subscribe to our newsletter and receive exclusive deals, new arrivals, and special offers straight to your inbox.
                </motion.p>
                <motion.form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/50" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9 h-11 bg-white/15 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 transition-shadow duration-200 focus:shadow-md focus:shadow-white/10 focus:border-white/40"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="h-11 px-6 font-semibold transition-all active:scale-95 bg-white text-orange-700 hover:bg-white/90 hover:text-orange-800 border-0 shadow-lg"
                  >
                    {loading ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </motion.form>
                <motion.p
                  className="text-xs text-white/60 mt-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  No spam, only the best deals 🔒 Unsubscribe anytime
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
