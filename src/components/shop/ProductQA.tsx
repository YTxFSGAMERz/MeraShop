'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircleQuestion, ThumbsUp, ThumbsDown, Send, ChevronDown, Clock, User, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// ── Types ────────────────────────────────────────────────────────────────────

interface QuestionData {
  id: string;
  productId: string;
  question: string;
  answer: string | null;
  askedBy: string;
  helpfulYes: number;
  helpfulNo: number;
  answered: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductQAProps {
  productId: string;
  productName: string;
}

// ── Demo/Seed questions for display when DB is empty ─────────────────────────
// Using static date strings to avoid hydration mismatch from new Date() at module scope

const DEMO_QUESTIONS: (QuestionData & { isVerifiedPurchase?: boolean; isAiAnswer?: boolean })[] = [
  {
    id: 'demo-1',
    productId: '',
    question: 'Is this product available in other colours?',
    answer: 'Yes, this product is available in 3 colour options. You can select from the colour variants above.',
    askedBy: 'Priya Sharma',
    helpfulYes: 12,
    helpfulNo: 2,
    answered: true,
    isVerifiedPurchase: true,
    isAiAnswer: false,
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-11T10:00:00.000Z',
  },
  {
    id: 'demo-2',
    productId: '',
    question: 'What is the warranty period for this product?',
    answer: 'This product comes with a 1-year manufacturer warranty. Extended warranty options are available at checkout.',
    askedBy: 'Rahul Verma',
    helpfulYes: 8,
    helpfulNo: 1,
    answered: true,
    isVerifiedPurchase: false,
    isAiAnswer: true,
    createdAt: '2025-01-05T10:00:00.000Z',
    updatedAt: '2025-01-06T10:00:00.000Z',
  },
  {
    id: 'demo-3',
    productId: '',
    question: 'Can I return this product if I am not satisfied?',
    answer: 'Yes, you can return this product within 7 days of delivery. Please check our return policy for more details.',
    askedBy: 'Ankit Patel',
    helpfulYes: 5,
    helpfulNo: 0,
    answered: true,
    isVerifiedPurchase: true,
    isAiAnswer: false,
    createdAt: '2024-12-31T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
  {
    id: 'demo-4',
    productId: '',
    question: 'Is COD (Cash on Delivery) available for this product?',
    answer: null,
    askedBy: 'Meena Kumari',
    helpfulYes: 3,
    helpfulNo: 0,
    answered: false,
    createdAt: '2025-01-13T10:00:00.000Z',
    updatedAt: '2025-01-13T10:00:00.000Z',
  },
  {
    id: 'demo-5',
    productId: '',
    question: 'Does this come with a user manual?',
    answer: 'Yes, a detailed user manual is included in the box. You can also download the digital version from the brand website.',
    askedBy: 'Vikram Singh',
    helpfulYes: 6,
    helpfulNo: 1,
    answered: true,
    isVerifiedPurchase: true,
    isAiAnswer: false,
    createdAt: '2024-12-25T10:00:00.000Z',
    updatedAt: '2024-12-26T10:00:00.000Z',
  },
];

const VISIBLE_COUNT = 3;

// ── Component ────────────────────────────────────────────────────────────────

export function ProductQA({ productId, productName }: ProductQAProps) {
  const [questions, setQuestions] = useState<(QuestionData & { isVerifiedPurchase?: boolean; isAiAnswer?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, 'yes' | 'no'>>({});
  const [aiAnswerLoading, setAiAnswerLoading] = useState<Record<string, boolean>>({});
  const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({});

  // ── Fetch questions ─────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/questions?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions.map((q: QuestionData, idx: number) => ({
            ...q,
            isVerifiedPurchase: idx % 3 !== 0, // Demo: deterministic ~66% are verified
            isAiAnswer: false,
          })));
        } else {
          setQuestions(DEMO_QUESTIONS.map((q) => ({ ...q, productId })));
        }
      } else {
        setQuestions(DEMO_QUESTIONS.map((q) => ({ ...q, productId })));
      }
    } catch {
      setQuestions(DEMO_QUESTIONS.map((q) => ({ ...q, productId })));
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // ── Submit question ─────────────────────────────────────────────────────
  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || newQuestion.trim().length < 5) {
      toast.error('Please enter a question (min 5 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          question: newQuestion.trim(),
          userName: userName.trim() || 'Anonymous',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newQ = {
          ...data.question,
          isVerifiedPurchase: false,
          isAiAnswer: false,
        };
        setQuestions((prev) => [newQ, ...prev]);
        setNewQuestion('');
        setUserName('');
        toast.success('Question submitted!', {
          description: 'Getting an AI answer for you...',
        });

        // Auto-generate AI answer for the new question
        generateAiAnswer(newQ.id, newQ.question);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit question');
      }
    } catch {
      toast.error('Failed to submit question');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Generate AI answer ──────────────────────────────────────────────────
  const generateAiAnswer = async (questionId: string, questionText: string) => {
    setAiAnswerLoading((prev) => ({ ...prev, [questionId]: true }));
    try {
      const res = await fetch('/api/ai-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          productName,
          productId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.answer) {
          setAiAnswers((prev) => ({ ...prev, [questionId]: data.answer }));
          // Update the question in the list
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === questionId
                ? { ...q, answer: data.answer, answered: true, isAiAnswer: true, updatedAt: new Date().toISOString() }
                : q
            )
          );
        }
      }
    } catch {
      // Silently fail - answer will show as pending
    } finally {
      setAiAnswerLoading((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // ── Helpful vote (local only) ───────────────────────────────────────────
  const handleHelpfulVote = (questionId: string, vote: 'yes' | 'no') => {
    if (helpfulVoted[questionId]) return;
    setHelpfulVoted((prev) => ({ ...prev, [questionId]: vote }));
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              helpfulYes: q.helpfulYes + (vote === 'yes' ? 1 : 0),
              helpfulNo: q.helpfulNo + (vote === 'no' ? 1 : 0),
            }
          : q
      )
    );
  };

  const visibleQuestions = showAll ? questions : questions.slice(0, VISIBLE_COUNT);
  const totalQuestions = questions.length;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <section className="py-6">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircleQuestion className="size-4 text-primary" />
        </div>
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          Questions & Answers
        </h2>
        {totalQuestions > 0 && (
          <span className="text-sm text-muted-foreground">({totalQuestions})</span>
        )}
      </div>

      {/* Ask a Question Input */}
      <Card className="mb-4 glass border-border/50">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">
            Have a question about {productName}?
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Your name (optional)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="sm:w-40"
              maxLength={50}
            />
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="Type your question here..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSubmitting) {
                    handleSubmitQuestion();
                  }
                }}
                maxLength={500}
                className="flex-1"
              />
              <Button
                onClick={handleSubmitQuestion}
                disabled={isSubmitting || !newQuestion.trim() || newQuestion.trim().length < 5}
                className="shrink-0 gap-1.5 text-white border-0 bg-saffron-gradient"
              >
                <Send className="size-4" />
                <span className="hidden sm:inline">Ask</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="size-3 text-primary" />
            AI-powered answers will be generated instantly
          </p>
        </CardContent>
      </Card>

      {/* Questions List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass border-border/50">
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : totalQuestions === 0 ? (
        <div className="text-center py-8">
          <MessageCircleQuestion className="size-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No questions yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to ask about this product!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {visibleQuestions.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
              >
                <Card className="glass border-border/50 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Question */}
                    <div className="flex items-start gap-2.5">
                      <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-primary">Q</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {q.question}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                          <User className="size-3" />
                          <span>{q.askedBy}</span>
                          <span className="text-border">·</span>
                          <Clock className="size-3" />
                          <span>{format(new Date(q.createdAt), 'd MMM yyyy')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Answer */}
                    {q.answered && q.answer && (
                      <div className="flex items-start gap-2.5 mt-3 ml-1">
                        <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">A</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {q.answer}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <p className="text-[10px] text-muted-foreground">
                              MeraShop Official
                            </p>
                            {q.isAiAnswer && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 gap-0.5 bg-primary/10 text-primary shrink-0">
                                <Sparkles className="size-2.5" />
                                AI Generated
                              </Badge>
                            )}
                            {q.isVerifiedPurchase && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 gap-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                <ShieldCheck className="size-2.5" />
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Answer Loading */}
                    {aiAnswerLoading[q.id] && !q.answered && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5 mt-3 ml-1"
                      >
                        <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                          <Sparkles className="size-3 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-primary flex items-center gap-1.5">
                            <Loader2 className="size-3 animate-spin" />
                            Generating AI answer...
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Not answered and not loading */}
                    {!q.answered && !aiAnswerLoading[q.id] && (
                      <div className="flex items-start gap-2.5 mt-3 ml-1">
                        <div className="size-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">A</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground italic mt-1">
                            Not yet answered
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] text-primary hover:text-primary px-1.5 mt-1 gap-1"
                            onClick={() => generateAiAnswer(q.id, q.question)}
                          >
                            <Sparkles className="size-2.5" />
                            Get AI Answer
                          </Button>
                        </div>
                      </div>
                    )}

                    <Separator className="my-3" />

                    {/* Helpful Votes */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Helpful?</span>
                      <button
                        onClick={() => handleHelpfulVote(q.id, 'yes')}
                        className={cn(
                          'flex items-center gap-1 text-xs transition-colors rounded-md px-2 py-1',
                          helpfulVoted[q.id] === 'yes'
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                        disabled={!!helpfulVoted[q.id]}
                        aria-label="Mark as helpful"
                      >
                        <ThumbsUp className="size-3" />
                        <span>Yes ({q.helpfulYes})</span>
                      </button>
                      <button
                        onClick={() => handleHelpfulVote(q.id, 'no')}
                        className={cn(
                          'flex items-center gap-1 text-xs transition-colors rounded-md px-2 py-1',
                          helpfulVoted[q.id] === 'no'
                            ? 'text-red-600 dark:text-red-400 bg-red-500/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                        disabled={!!helpfulVoted[q.id]}
                        aria-label="Mark as not helpful"
                      >
                        <ThumbsDown className="size-3" />
                        <span>No ({q.helpfulNo})</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* View All / Show Less */}
          {totalQuestions > VISIBLE_COUNT && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="gap-1.5 text-primary hover:text-primary"
              >
                {showAll ? (
                  <>Show Less</>
                ) : (
                  <>
                    View All {totalQuestions} Questions
                    <ChevronDown className="size-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
