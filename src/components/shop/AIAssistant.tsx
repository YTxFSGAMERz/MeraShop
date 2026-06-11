'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, MessageCircle, Search, Truck, Package, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type QuickAction = {
  label: string;
  icon: React.ReactNode;
  message: string;
};

// ── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Find deals',
    icon: <Search className="size-3.5" />,
    message: 'What are the best deals right now?',
  },
  {
    label: 'Track my order',
    icon: <Truck className="size-3.5" />,
    message: 'How can I track my order?',
  },
  {
    label: 'Product recommendations',
    icon: <Sparkles className="size-3.5" />,
    message: 'Can you recommend some products?',
  },
  {
    label: 'Return policy',
    icon: <RotateCcw className="size-3.5" />,
    message: 'What is your return policy?',
  },
];

// ── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-sm">
        <Sparkles className="size-4 text-white" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
          <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
          <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ── Chat Panel Content ──────────────────────────────────────────────────────

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm MeraShop AI Assistant. How can I help you today? 😊",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText.trim(), history }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process that. Please try again!",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🙏",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.message);
  };

  return (
    <div className="flex h-full flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-sm">
            <Sparkles className="size-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">MeraShop AI</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* ── Messages Area ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex items-start gap-2',
              msg.role === 'user' && 'flex-row-reverse'
            )}
          >
            {/* Avatar */}
            {msg.role === 'assistant' ? (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-sm">
                <Sparkles className="size-4 text-white" />
              </div>
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="size-4 text-primary" />
              </div>
            )}

            {/* Message bubble */}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                msg.role === 'assistant'
                  ? 'rounded-tl-sm bg-muted text-foreground'
                  : 'rounded-tr-sm bg-gradient-to-br from-orange-500 to-amber-500 text-white'
              )}
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Actions (show only at start) ──────────────────────────── */}
      {messages.length <= 1 && !isLoading && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm active:scale-95"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Area ──────────────────────────────────────────────────── */}
      <div className="border-t p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 text-sm"
            maxLength={500}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="size-9 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
          >
            <Send className="size-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
          AI can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
}

// ── Main AIAssistant Component ──────────────────────────────────────────────

export function AIAssistant() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Desktop: Sheet from right side
  if (!isMobile) {
    return (
      <>
        {/* Floating Button */}
        <motion.button
          onClick={() => setOpen(true)}
          className={cn(
            'fixed z-50 flex items-center justify-center',
            'size-12 rounded-full',
            'bg-gradient-to-br from-orange-500 to-amber-500 text-white',
            'shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30',
            'transition-shadow duration-200',
            'bottom-6 right-6'
          )}
          aria-label="Open AI shopping assistant"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Sparkles className="size-5" />
        </motion.button>

        {/* Desktop: Sheet from right */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="right"
            className="w-[400px] sm:max-w-[400px] p-0 gap-0 backdrop-blur-xl bg-background/95 border-border/50 shadow-2xl"
          >
            <SheetTitle className="sr-only">MeraShop AI Shopping Assistant</SheetTitle>
            <SheetDescription className="sr-only">
              Chat with our AI assistant for product recommendations and support
            </SheetDescription>
            <ChatPanel onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Mobile: Drawer from bottom
  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed z-50 flex items-center justify-center',
          'size-12 rounded-full',
          'bg-gradient-to-br from-orange-500 to-amber-500 text-white',
          'shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30',
          'transition-shadow duration-200',
          'bottom-20 right-4'
        )}
        aria-label="Open AI shopping assistant"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
      >
        <Sparkles className="size-5" />
      </motion.button>

      {/* Mobile: Drawer from bottom */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="h-[85vh] max-h-[85vh] p-0">
          <DrawerTitle className="sr-only">MeraShop AI Shopping Assistant</DrawerTitle>
          <DrawerDescription className="sr-only">
            Chat with our AI assistant for product recommendations and support
          </DrawerDescription>
          <ChatPanel onClose={() => setOpen(false)} />
        </DrawerContent>
      </Drawer>
    </>
  );
}
