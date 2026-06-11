'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Send,
  ShieldCheck,
  Smartphone,
  Lock,
  Headphones,
  RotateCcw,
  ArrowUp,
  CreditCard,
  ExternalLink,
  Newspaper,
  Tv,
  Globe,
} from 'lucide-react';

import { SITE_NAME, SITE_TAGLINE, FOOTER_LINKS, PAYMENT_METHODS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: '#', hoverColor: 'hover:bg-blue-600', hoverScale: 1.15 },
  { icon: Instagram, label: 'Instagram', href: '#', hoverColor: 'hover:bg-pink-600', hoverScale: 1.15 },
  { icon: Twitter, label: 'Twitter', href: '#', hoverColor: 'hover:bg-sky-500', hoverScale: 1.15 },
  { icon: Youtube, label: 'YouTube', href: '#', hoverColor: 'hover:bg-red-600', hoverScale: 1.15 },
];

const customerServiceHighlights = [
  { icon: Headphones, title: '24/7 Support', subtitle: 'We\'re here to help anytime' },
  { icon: RotateCcw, title: 'Easy Returns', subtitle: '7-day hassle-free returns' },
  { icon: ShieldCheck, title: 'Secure Payments', subtitle: 'SSL encrypted transactions' },
];

const mediaMentions = [
  { name: 'Economic Times', icon: Newspaper },
  { name: 'NDTV', icon: Tv },
  { name: 'YourStory', icon: Globe },
  { name: 'TechCrunch', icon: ExternalLink },
];

export function SiteFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      // Reset after 3 seconds
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sections = Object.values(FOOTER_LINKS);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/60 text-muted-foreground mt-auto" suppressHydrationWarning>
      {/* ── Gradient Top Border (saffron → amber → orange) ──────────────── */}
      <div className="h-1.5 bg-footer-border" />

      {/* ── Newsletter Banner ────────────────────────────────────────────── */}
      <div className="border-b border-border/50 relative overflow-hidden bg-footer-newsletter">
        <div className="absolute inset-0 indian-pattern-overlay opacity-40" />
        <div className="container-shop px-4 md:px-6 lg:px-8 py-8 md:py-10 relative">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex items-center gap-4 md:min-w-0">
              <div className="size-12 rounded-full flex items-center justify-center shrink-0 text-white bg-saffron-gradient">
                <Mail className="size-6" />
              </div>
              <div className="text-center md:text-left">
                <p className="font-bold text-foreground text-base md:text-lg">
                  Get exclusive deals in your inbox
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Subscribe for offers, new arrivals & more! No spam, we promise.
                </p>
              </div>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex w-full md:max-w-md gap-2"
            >
              <div className="relative flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/80 backdrop-blur-sm h-11 pl-4 pr-10 border-primary/20 focus:border-primary/40"
                />
              </div>
              <Button type="submit" size="default" className="shrink-0 h-11 px-6 gap-2 text-white border-0 bg-saffron-gradient">
                <Send className="size-4" />
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Customer Service Highlights ─────────────────────────────────── */}
      <div className="border-b border-border/50">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-5 md:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
            {customerServiceHighlights.map((item) => {
              const IconComp = item.icon;
              return (
                <div key={item.title} className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="size-10 rounded-full flex items-center justify-center shrink-0 bg-primary-icon">
                    <IconComp className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Footer Content ──────────────────────────────────────────── */}
      <div className="container-shop px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Branding Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 mb-4 lg:mb-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 group mb-3"
            >
              <ShoppingBag className="size-5 text-primary transition-transform group-hover:scale-110" />
              <span className="text-lg font-extrabold text-foreground">
                {SITE_NAME}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {SITE_TAGLINE}. Discover the best of Indian shopping with
              unbeatable prices and fast delivery.
            </p>
            {/* Social Icons with hover effects - scale + color change */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, label, href, hoverColor, hoverScale }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground transition-colors duration-200 ${hoverColor} hover:text-white`}
                  whileHover={{ scale: hoverScale }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="size-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns - now 4 columns on lg */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-foreground text-sm mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary hover:translate-x-0.5 transition-all duration-200 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── As Seen On Media Mentions ───────────────────────────────────── */}
      <div className="border-t border-border/30">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <p className="text-xs font-medium text-muted-foreground shrink-0">As seen on</p>
            <div className="flex items-center gap-4 sm:gap-6">
              {mediaMentions.map((mention) => {
                const IconComp = mention.icon;
                return (
                  <motion.div
                    key={mention.name}
                    className="flex items-center gap-1.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <IconComp className="size-3.5" />
                    <span className="text-xs font-medium">{mention.name}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Download App & Trust Section ─────────────────────────────────── */}
      <div className="border-t border-border/50">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Download App - More prominent with glass-morphism effect */}
            <div className="flex flex-col sm:flex-row items-center gap-4 glass rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl flex items-center justify-center bg-saffron-gradient">
                  <Smartphone className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Download our App</p>
                  <p className="text-[10px] text-muted-foreground">Shop faster & get exclusive app-only deals</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Google Play Badge */}
                <div className="flex items-center gap-2 rounded-lg bg-foreground/90 px-3 py-2 text-background cursor-pointer hover:bg-foreground transition-colors">
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 13l2.302-2.49zM5.864 3.458L16.8 9.791l-2.302 2.302L5.864 3.458z" />
                  </svg>
                  <div className="text-[10px] leading-tight">
                    <div className="opacity-80">GET IT ON</div>
                    <div className="font-semibold text-xs">Google Play</div>
                  </div>
                </div>
                {/* App Store Badge */}
                <div className="flex items-center gap-2 rounded-lg bg-foreground/90 px-3 py-2 text-background cursor-pointer hover:bg-foreground transition-colors">
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-[10px] leading-tight">
                    <div className="opacity-80">Download on the</div>
                    <div className="font-semibold text-xs">App Store</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 100% Secure Payments */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="size-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  100% Secure Payments
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  All transactions are encrypted & protected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* ── Bottom Bar ────────────────────────────────────────────────────── */}
      <div className="container-shop px-4 md:px-6 lg:px-8 py-4 md:py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Payment Methods */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="flex items-center gap-1.5 mr-2">
              <CreditCard className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">
                We accept:
              </span>
            </div>
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method.id}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-background border border-border text-foreground shadow-sm"
              >
                {method.label}
              </span>
            ))}
          </div>

          {/* Copyright + Back to top */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <button
              onClick={handleBackToTop}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
              aria-label="Back to top"
            >
              <ArrowUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
              Back to top
            </button>
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-xs text-muted-foreground text-center md:text-right">
                &copy; {currentYear} {SITE_NAME}. All rights reserved. |{' '}
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy
                </Link>{' '}
                &amp;{' '}
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Made with ❤️ in India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Animated Back to Top Button ──────────────────────────────────── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={handleBackToTop}
            className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 size-11 rounded-full flex items-center justify-center shadow-lg text-white border-0 cursor-pointer bg-saffron-gradient"
            aria-label="Back to top"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}
