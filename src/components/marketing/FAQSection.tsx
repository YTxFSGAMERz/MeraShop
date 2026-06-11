'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

const staticFaqs = [
  {
    question: 'How long does delivery take?',
    answer:
      'Delivery typically takes 2-7 business days depending on your location. Metro cities usually receive orders within 2-3 days, while rural areas may take 5-7 days. You can track your order in real-time through the Track Order page.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major payment methods including UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking from all major banks, Cash on Delivery (COD), and EMI options on selected products.',
  },
  {
    question: 'Can I return a product?',
    answer:
      'Yes! We offer a 7-day easy return policy on most products. Simply raise a return request from your order page, and our delivery partner will pick up the product from your doorstep. Refunds are processed within 5-7 business days.',
  },
  {
    question: 'Is COD (Cash on Delivery) available?',
    answer:
      'Yes, Cash on Delivery is available on most products across India. There is a nominal COD fee of ₹40 which is waived for orders above ₹999. Some high-value items may require partial pre-payment.',
  },
  {
    question: 'How do I track my order?',
    answer:
      'You can track your order by visiting the "Track Order" section in your account. You will also receive SMS and email updates at each stage of delivery, including when your order is shipped, out for delivery, and delivered.',
  },
  {
    question: 'Are the products genuine?',
    answer:
      'Absolutely! All products sold on MeraShop are 100% genuine and sourced directly from authorized sellers and brands. We have a strict quality check process and offer a Brand Trust Guarantee on all products.',
  },
  {
    question: 'Do you offer EMI options?',
    answer:
      'Yes, we offer No-Cost EMI on selected products and regular EMI options on orders above ₹3,000. EMI is available through major banks and NBFCs. Check the product page for EMI availability.',
  },
  {
    question: 'How can I contact customer support?',
    answer:
      'You can reach us through our Help Center, by emailing support@merashop.in, or by calling our toll-free number 1800-XXX-XXXX (9 AM - 9 PM IST, 7 days a week). We also offer live chat support on the website.',
  },
];

export function FAQSection() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-shop">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full mb-3">
            <HelpCircle className="size-4" />
            <span className="text-sm font-medium">Got Questions?</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Find quick answers to common questions about shopping on MeraShop
          </p>
        </div>

        {/* FAQ Accordion */}
        <Card className="max-w-3xl mx-auto border-border/50">
          <CardContent className="p-4 md:p-6">
            <Accordion type="single" collapsible className="w-full">
              {staticFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
