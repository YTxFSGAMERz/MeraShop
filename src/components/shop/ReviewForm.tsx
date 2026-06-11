'use client';

import { useState } from 'react';
import { Star, Send, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { notifyReviewSubmit } from '@/lib/notifications';

interface ReviewFormProps {
  productId: string;
  productName: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ productId, productName, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (rating === 0) newErrors.rating = 'Please select a rating';
    if (comment.trim().length > 0 && comment.trim().length < 10)
      newErrors.comment = 'Review must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId: 'guest',
          rating,
          title: title.trim() || null,
          comment: comment.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      setIsSuccess(true);
      toast.success('Review submitted!', {
        description: `Thanks for reviewing ${productName}`,
      });
      notifyReviewSubmit();

      // Reset after a moment
      setTimeout(() => {
        setRating(0);
        setTitle('');
        setComment('');
        setIsSuccess(false);
        onReviewSubmitted?.();
      }, 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in-up">
        <div className="size-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
          <Check className="size-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Review Submitted!</h3>
        <p className="text-sm text-muted-foreground">
          Thank you for sharing your experience with {productName}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star Rating */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Your Rating <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={cn(
                'p-0.5 transition-transform hover:scale-110',
                (hoverRating || rating) >= star ? 'text-amber-400' : 'text-muted-foreground/40'
              )}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => {
                setRating(star);
                if (errors.rating) setErrors((prev) => ({ ...prev, rating: '' }));
              }}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  'size-7 transition-colors',
                  (hoverRating || rating) >= star && 'fill-amber-400'
                )}
              />
            </button>
          ))}
          {(hoverRating || rating) > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][(hoverRating || rating)]}
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="text-xs text-destructive mt-1">{errors.rating}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Review Title
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
        />
      </div>

      {/* Comment */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Your Review
        </label>
        <Textarea
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (errors.comment) setErrors((prev) => ({ ...prev, comment: '' }));
          }}
          placeholder="Tell others about your experience with this product..."
          rows={4}
          maxLength={1000}
        />
        <div className="flex justify-between mt-1">
          {errors.comment ? (
            <p className="text-xs text-destructive">{errors.comment}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Minimum 10 characters</p>
          )}
          <p className="text-xs text-muted-foreground">{comment.length}/1000</p>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Submit Review
          </>
        )}
      </Button>
    </form>
  );
}
