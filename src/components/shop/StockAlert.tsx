'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Loader2, X, Mail, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ── Types ──────────────────────────────────────────────────────────────────

interface StockAlertProps {
  productId: string;
  productName: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export function StockAlert({ productId, productName }: StockAlertProps) {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/stock-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email: email.trim() }),
      });

      if (res.ok) {
        setIsSuccess(true);
        toast.success('You\'ll be notified when this is back in stock!');
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state with enhanced animation
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative overflow-hidden flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
      >
        {/* Animated background confetti effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute size-1.5 rounded-full"
              style={{
                background: i % 2 === 0 ? '#10b981' : '#f59e0b',
                left: `${15 + i * 15}%`,
                top: '50%',
              }}
              initial={{ y: 0, opacity: 0, scale: 0 }}
              animate={{
                y: [0, -20, -30],
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
              }}
              transition={{
                duration: 1,
                delay: 0.2 + i * 0.08,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>

        {/* Success checkmark with bounce */}
        <motion.div
          className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.1 }}
        >
          <Check className="size-5 text-emerald-600 dark:text-emerald-400" />
        </motion.div>

        <div className="relative">
          <motion.p
            className="text-sm font-semibold text-emerald-700 dark:text-emerald-300"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            We&apos;ll notify you!
          </motion.p>
          <motion.p
            className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            You&apos;ll get an email when <span className="font-medium">{productName}</span> is back in stock.
          </motion.p>
        </div>

        <motion.div
          className="shrink-0 ml-auto"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <PartyPopper className="size-5 text-emerald-500 dark:text-emerald-400" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Out of Stock Badge */}
      <Badge variant="destructive" className="text-sm px-3 py-1">
        Out of Stock
      </Badge>

      {/* Notify Me Button / Form */}
      {!showEmailInput ? (
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className="w-full gap-2 h-12 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary group"
            onClick={() => setShowEmailInput(true)}
          >
            <motion.span
              className="inline-flex"
              whileHover={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Bell className="size-4" />
            </motion.span>
            Notify Me When Available
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Mail className="size-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              Enter your email and we&apos;ll notify you as soon as <span className="font-medium text-foreground">{productName}</span> is back in stock.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              className="flex-1 h-11 text-sm"
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !email.trim()}
              size="sm"
              className="h-11 px-5 text-white border-0 bg-saffron-gradient"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <motion.span className="flex items-center gap-1.5">
                  <Bell className="size-3.5" />
                  Notify
                </motion.span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowEmailInput(false);
                setEmail('');
              }}
              className="h-11 px-2 shrink-0"
              aria-label="Cancel"
            >
              <X className="size-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
