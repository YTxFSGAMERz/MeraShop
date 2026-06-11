'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2, Truck, AlertCircle, Banknote, CreditCard, Loader2 } from 'lucide-react';
import { addDays, format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ── Types ──────────────────────────────────────────────────────────────────

interface PincodeCheckerProps {
  isFreeDelivery?: boolean;
}

interface DeliveryResult {
  estimatedDate: string;
  codAvailable: boolean;
  deliveryCharge: number;
  isValid: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/** Generate deterministic-looking but fake delivery info based on pincode */
function generateDeliveryEstimate(pincode: string, isFreeDelivery?: boolean): DeliveryResult {
  // Use the last 2 digits to vary delivery days (3-7 range)
  const suffix = parseInt(pincode.slice(-2), 10);
  const daysOffset = (suffix % 5); // 0-4
  const deliveryDays = 3 + daysOffset;

  // Note: new Date() is fine here because this function is only called
  // inside a callback (handleCheck), not during render
  const estimatedDate = format(addDays(new Date(), deliveryDays), 'EEE, d MMM');

  // Use pincode to determine COD availability (most pincodes have COD)
  const codAvailable = suffix % 7 !== 0; // ~85% have COD

  // Delivery charge
  const deliveryCharge = isFreeDelivery ? 0 : (suffix % 3 === 0 ? 0 : 49);

  return {
    estimatedDate,
    codAvailable,
    deliveryCharge,
    isValid: true,
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export function PincodeChecker({ isFreeDelivery }: PincodeCheckerProps) {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<DeliveryResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = useCallback(async () => {
    setError(null);
    setResult(null);

    // Validate pincode format
    if (!PINCODE_REGEX.test(pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setIsChecking(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const estimate = generateDeliveryEstimate(pincode, isFreeDelivery);
    setResult(estimate);
    setIsChecking(false);
  }, [pincode, isFreeDelivery]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleCheck();
      }
    },
    [handleCheck],
  );

  const handlePincodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
      setPincode(val);
      if (result) setResult(null);
      if (error) setError(null);
    },
    [result, error],
  );

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Check delivery availability</p>

      {/* Input Row */}
      <div className="flex gap-2">
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Enter 6-digit pincode"
          value={pincode}
          onChange={handlePincodeChange}
          onKeyDown={handleKeyDown}
          maxLength={6}
          className="flex-1 h-10 text-sm"
          aria-label="Pincode"
        />
        <Button
          onClick={handleCheck}
          disabled={pincode.length < 6 || isChecking}
          size="sm"
          className="h-10 px-4"
        >
          {isChecking ? (
            <div className="flex items-center gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : (
            'Check'
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && result.isValid && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Delivery date */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-green-600 dark:text-green-400 shrink-0" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Delivery by {result.estimatedDate}
            </span>
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* COD Badge */}
            {result.codAvailable ? (
              <Badge
                variant="outline"
                className="gap-1 text-green-600 border-green-300 dark:text-green-400 dark:border-green-700 text-xs"
              >
                <Banknote className="size-3" />
                COD Available
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700 text-xs"
              >
                <CreditCard className="size-3" />
                Prepaid Only
              </Badge>
            )}

            {/* Delivery charge badge */}
            <Badge
              variant="outline"
              className={cn(
                'gap-1 text-xs',
                result.deliveryCharge === 0
                  ? 'text-green-600 border-green-300 dark:text-green-400 dark:border-green-700'
                  : 'text-foreground border-border',
              )}
            >
              <Truck className="size-3" />
              {result.deliveryCharge === 0 ? 'Free Delivery' : `Delivery: ₹${result.deliveryCharge}`}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
