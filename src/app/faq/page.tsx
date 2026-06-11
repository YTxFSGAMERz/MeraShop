'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, Search, MessageCircle, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const categories = [
  { value: 'all', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'returns', label: 'Returns' },
  { value: 'payment', label: 'Payment' },
  { value: 'account', label: 'Account' },
];

function FAQPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchFAQs() {
      try {
        const res = await fetch('/api/faq');
        const data = await res.json();
        setFaqs(data.faqs || []);
      } catch (err) {
        console.error('Failed to fetch FAQs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFAQs();
  }, []);

  const filteredFAQs = useMemo(() => {
    let filtered = faqs;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(
        (faq) => faq.category?.toLowerCase() === activeCategory
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(q) ||
          faq.answer.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [faqs, activeCategory, searchQuery]);

  // Group filtered FAQs by category for display
  const groupedFAQs = useMemo(() => {
    const grouped: Record<string, FAQ[]> = {};
    filteredFAQs.forEach((faq) => {
      const cat = faq.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(faq);
    });
    return grouped;
  }, [filteredFAQs]);

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="container-shop px-4 md:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <HelpCircle className="size-10 text-white/80 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-base md:text-lg text-white/90">
              Find quick answers to common questions about shopping on MeraShop.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      </section>

      <div className="section-padding">
        <div className="container-shop px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* ── Search ──────────────────────────────────────────────────── */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* ── Category Tabs ───────────────────────────────────────────── */}
            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="mb-8"
            >
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
                {categories.map((cat) => (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* ── FAQ Content ─────────────────────────────────────────────── */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <Skeleton className="h-5 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3 mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <HelpCircle className="size-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-1">
                    No results found
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {searchQuery
                      ? `No FAQs match "${searchQuery}". Try a different search or browse by category.`
                      : 'No FAQs found in this category.'}
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedFAQs).map(([category, categoryFaqs]) => (
                  <div key={category}>
                    {activeCategory === 'all' && (
                      <h3 className="font-semibold text-lg mb-3 capitalize">
                        {category}
                      </h3>
                    )}
                    <Accordion type="single" collapsible className="space-y-2">
                      {categoryFaqs.map((faq, index) => (
                        <AccordionItem
                          key={faq.id}
                          value={faq.id}
                          className="border rounded-lg px-4 data-[state=open]:bg-muted/30"
                        >
                          <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline py-4">
                            <span className="flex items-start gap-2">
                              <span className="text-primary font-bold shrink-0">
                                {index + 1}.
                              </span>
                              {faq.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            )}

            {/* ── Still Have Questions CTA ────────────────────────────────── */}
            <Card className="mt-12 bg-primary/5 border-primary/20">
              <CardContent className="p-6 md:p-8 text-center">
                <MessageCircle className="size-10 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">
                  Still have questions?
                </h3>
                <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
                  Can&apos;t find what you&apos;re looking for? Our support team is
                  happy to help you with any queries.
                </p>
                <Button asChild>
                  <Link href="/contact">
                    Contact Us
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="section-padding">
          <div className="container-shop px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <FAQPageContent />
    </Suspense>
  );
}
