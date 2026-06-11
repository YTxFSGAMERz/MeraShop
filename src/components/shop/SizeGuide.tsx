'use client';

import { useState } from 'react';
import { Ruler, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

// ── Size Chart Data ──────────────────────────────────────────────────────────

const CLOTHING_SIZES = [
  { size: 'XS', chest: '32-34', waist: '26-28', hip: '34-36', uk: '4-6', us: '0-2', india: '32-34' },
  { size: 'S', chest: '34-36', waist: '28-30', hip: '36-38', uk: '8-10', us: '4-6', india: '34-36' },
  { size: 'M', chest: '36-38', waist: '30-32', hip: '38-40', uk: '12-14', us: '8-10', india: '36-38' },
  { size: 'L', chest: '38-40', waist: '32-34', hip: '40-42', uk: '16-18', us: '12-14', india: '38-40' },
  { size: 'XL', chest: '40-42', waist: '34-36', hip: '42-44', uk: '20-22', us: '16-18', india: '40-42' },
  { size: 'XXL', chest: '42-44', waist: '36-38', hip: '44-46', uk: '24-26', us: '20-22', india: '42-44' },
];

const FOOTWEAR_SIZES = [
  { uk: '3', india: '3', eu: '36', us: '5', footLength: '22.5' },
  { uk: '4', india: '4', eu: '37', us: '6', footLength: '23.0' },
  { uk: '5', india: '5', eu: '38', us: '7', footLength: '23.5' },
  { uk: '6', india: '6', eu: '39', us: '8', footLength: '24.5' },
  { uk: '7', india: '7', eu: '40', us: '9', footLength: '25.0' },
  { uk: '8', india: '8', eu: '41', us: '10', footLength: '25.5' },
  { uk: '9', india: '9', eu: '42', us: '11', footLength: '26.5' },
  { uk: '10', india: '10', eu: '43', us: '12', footLength: '27.0' },
  { uk: '11', india: '11', eu: '44', us: '13', footLength: '27.5' },
  { uk: '12', india: '12', eu: '45', us: '14', footLength: '28.0' },
];

const ACCESSORY_SIZES = [
  { ringSize: '4', diameter: '14.9', circumference: '46.7' },
  { ringSize: '5', diameter: '15.7', circumference: '49.3' },
  { ringSize: '6', diameter: '16.5', circumference: '51.9' },
  { ringSize: '7', diameter: '17.3', circumference: '54.4' },
  { ringSize: '8', diameter: '18.2', circumference: '57.0' },
  { ringSize: '9', diameter: '18.9', circumference: '59.5' },
  { ringSize: '10', diameter: '19.8', circumference: '62.1' },
  { ringSize: '11', diameter: '20.6', circumference: '64.6' },
  { ringSize: '12', diameter: '21.4', circumference: '67.2' },
];

const HOW_TO_MEASURE = [
  {
    label: 'Chest',
    description: 'Measure around the fullest part of your chest, keeping the tape horizontal and snug but not tight.',
  },
  {
    label: 'Waist',
    description: 'Measure around your natural waistline, which is the narrowest part of your torso. Keep the tape comfortably loose.',
  },
  {
    label: 'Hip',
    description: 'Measure around the fullest part of your hips and buttocks, keeping the tape horizontal.',
  },
  {
    label: 'Foot Length',
    description: 'Stand on a piece of paper and mark the tip of your longest toe and the back of your heel. Measure the distance between the two points.',
  },
];

// ── Table Component ──────────────────────────────────────────────────────────

function SizeTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary/5 border-b">
              {headers.map((header, i) => (
                <th
                  key={i}
                  className={cn(
                    'px-3 py-2.5 text-left font-semibold text-foreground whitespace-nowrap',
                    i === 0 && 'sticky left-0 bg-primary/5'
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'border-b last:border-b-0 transition-colors',
                  rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                )}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn(
                      'px-3 py-2.5 text-muted-foreground whitespace-nowrap',
                      cellIndex === 0 && 'font-medium text-foreground sticky left-0',
                      cellIndex === 0 && rowIndex % 2 === 0 && 'bg-background',
                      cellIndex === 0 && rowIndex % 2 !== 0 && 'bg-muted/30'
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Size Guide Content ───────────────────────────────────────────────────────

function SizeGuideContent() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="clothing" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-auto p-1">
          <TabsTrigger value="clothing" className="text-xs sm:text-sm py-2">
            Clothing
          </TabsTrigger>
          <TabsTrigger value="footwear" className="text-xs sm:text-sm py-2">
            Footwear
          </TabsTrigger>
          <TabsTrigger value="accessories" className="text-xs sm:text-sm py-2">
            Accessories
          </TabsTrigger>
        </TabsList>

        {/* Clothing Tab */}
        <TabsContent value="clothing" className="mt-4">
          <p className="text-xs text-muted-foreground mb-3">
            All measurements are in inches. Indian sizing is prominently shown.
          </p>
          <SizeTable
            headers={['Size', 'India (in)', 'Chest (in)', 'Waist (in)', 'Hip (in)', 'UK Size', 'US Size']}
            rows={CLOTHING_SIZES.map((s) => [s.size, s.india, s.chest, s.waist, s.hip, s.uk, s.us])}
          />
        </TabsContent>

        {/* Footwear Tab */}
        <TabsContent value="footwear" className="mt-4">
          <p className="text-xs text-muted-foreground mb-3">
            Foot length in centimetres. India/UK sizes are most commonly used.
          </p>
          <SizeTable
            headers={['UK / India', 'EU Size', 'US Size', 'Foot Length (cm)']}
            rows={FOOTWEAR_SIZES.map((s) => [s.uk, s.eu, s.us, s.footLength])}
          />
        </TabsContent>

        {/* Accessories Tab */}
        <TabsContent value="accessories" className="mt-4">
          <p className="text-xs text-muted-foreground mb-3">
            Ring sizes with diameter and circumference in millimetres.
          </p>
          <SizeTable
            headers={['Ring Size', 'Diameter (mm)', 'Circumference (mm)']}
            rows={ACCESSORY_SIZES.map((s) => [s.ringSize, s.diameter, s.circumference])}
          />
        </TabsContent>
      </Tabs>

      {/* How to Measure Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Ruler className="size-4 text-primary" />
          How to Measure
        </h4>
        <div className="space-y-3">
          {HOW_TO_MEASURE.map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">{item.label.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main SizeGuide Component ─────────────────────────────────────────────────

export function SizeGuide() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // Mobile: Drawer, Desktop: Dialog
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8"
          >
            <Ruler className="size-3.5" />
            Size Guide
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2">
                <Ruler className="size-5 text-primary" />
                Size Guide
              </DrawerTitle>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
            <SizeGuideContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs h-8"
        >
          <Ruler className="size-3.5" />
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="size-5 text-primary" />
            Size Guide
          </DialogTitle>
        </DialogHeader>
        <SizeGuideContent />
      </DialogContent>
    </Dialog>
  );
}
