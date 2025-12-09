'use client';

import { motion } from 'framer-motion';
import { Check, X, ArrowRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    annualPrice: '$0',
    period: 'forever',
    description: 'Perfect for getting started with practice planning.',
    highlights: [
      '1 team',
      'Unlimited practice plans',
      'Period management',
      'Basic calendar view',
      'Mobile app access',
      'Plan sharing links',
    ],
    cta: 'Get Started',
    href: '/register',
    featured: false,
  },
  {
    name: 'Coach',
    price: '$2.49',
    annualPrice: '$1.99',
    period: '/month',
    description: 'Full features for serious coaches.',
    highlights: [
      'Everything in Free',
      'PDF export with branding',
      'Practice templates',
      'Smart tags',
      'File uploads (10GB)',
      'Up to 5 assistant coaches',
      '10 file versions',
      'Team announcements',
      'Analytics dashboard',
    ],
    cta: 'Start Free Trial',
    href: '/register',
    featured: true,
  },
  {
    name: 'Organization',
    price: '$14.99',
    annualPrice: '$11.99',
    period: '/month',
    description: 'For schools, clubs, and multi-team programs.',
    highlights: [
      'Everything in Coach',
      'Unlimited teams',
      'Unlimited coaches',
      'Shared template library',
      'Custom team branding',
      '50GB file storage',
      '50 file versions',
      'Organization dashboard',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/register',
    featured: false,
  },
];

interface ComparisonRow {
  feature: string;
  tooltip?: string;
  free: boolean | string;
  coach: boolean | string;
  organization: boolean | string;
}

const comparisonData: { category: string; features: ComparisonRow[] }[] = [
  {
    category: 'Core Planning',
    features: [
      { feature: 'Practice Plans', free: 'Unlimited', coach: 'Unlimited', organization: 'Unlimited' },
      { feature: 'Teams', free: '1', coach: '1', organization: 'Unlimited' },
      { feature: 'Period Management', free: true, coach: true, organization: true },
      { feature: 'Calendar View', free: true, coach: true, organization: true },
      { feature: 'Practice Templates', tooltip: 'Save and reuse complete practice layouts', free: false, coach: true, organization: true },
      { feature: 'Smart Tags', tooltip: 'Categorize and filter activities', free: false, coach: true, organization: true },
    ],
  },
  {
    category: 'PDF & Sharing',
    features: [
      { feature: 'Plan Sharing Links', free: true, coach: true, organization: true },
      { feature: 'QR Code Access', free: true, coach: true, organization: true },
      { feature: 'PDF Export', free: false, coach: true, organization: true },
      { feature: 'PDF Templates', tooltip: 'Standard, Compact, and Detailed layouts', free: '—', coach: '3 templates', organization: '3 templates' },
      { feature: 'Team Branding on PDFs', free: false, coach: true, organization: true },
    ],
  },
  {
    category: 'File Management',
    features: [
      { feature: 'File Uploads', free: false, coach: true, organization: true },
      { feature: 'Storage Space', free: '—', coach: '10 GB', organization: '50 GB' },
      { feature: 'Folder Organization', free: false, coach: true, organization: true },
      { feature: 'File Sharing', tooltip: 'Share files with permissions and expiration', free: false, coach: true, organization: true },
      { feature: 'Version History', free: '—', coach: '10 versions', organization: '50 versions' },
    ],
  },
  {
    category: 'Team Collaboration',
    features: [
      { feature: 'Assistant Coaches', free: '0', coach: '5', organization: 'Unlimited' },
      { feature: 'Permission Levels', tooltip: 'Admin, Edit, and View-only roles', free: true, coach: true, organization: true },
      { feature: 'Team Announcements', free: false, coach: true, organization: true },
      { feature: 'Read Tracking', tooltip: 'See who has read announcements', free: false, coach: true, organization: true },
    ],
  },
  {
    category: 'Analytics',
    features: [
      { feature: 'Analytics Dashboard', free: false, coach: true, organization: true },
      { feature: 'Practice Statistics', free: false, coach: true, organization: true },
      { feature: 'Tag Usage Reports', free: false, coach: true, organization: true },
    ],
  },
  {
    category: 'Organization Features',
    features: [
      { feature: 'Organization Dashboard', free: false, coach: false, organization: true },
      { feature: 'Shared Template Library', tooltip: 'Share templates across all teams', free: false, coach: false, organization: true },
      { feature: 'Custom Team Branding', tooltip: 'Logos, colors, and fonts per team', free: false, coach: false, organization: true },
      { feature: 'Priority Support', free: false, coach: false, organization: true },
    ],
  },
  {
    category: 'Platform',
    features: [
      { feature: 'Web App', free: true, coach: true, organization: true },
      { feature: 'iOS App', free: true, coach: true, organization: true },
      { feature: 'Android App', free: true, coach: true, organization: true },
      { feature: 'Offline Access', free: true, coach: true, organization: true },
    ],
  },
];

const faqs = [
  {
    question: 'Can I try before I buy?',
    answer: 'Yes! Start with our free plan to explore basic features, or try Coach and Organization features free for 14 days. No credit card required to start.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. You can cancel your subscription at any time from your account settings. You\'ll continue to have access through the end of your current billing period.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay through our secure payment processor, Stripe.',
  },
  {
    question: 'Is there a discount for annual billing?',
    answer: 'Yes! Save 20% when you choose annual billing. That\'s effectively getting 2 months free each year.',
  },
  {
    question: 'What happens to my data if I downgrade?',
    answer: 'Your data is never deleted. If you downgrade, you\'ll lose access to premium features but can still view your existing plans. You can upgrade again anytime to regain full access.',
  },
  {
    question: 'Do you offer discounts for schools or non-profits?',
    answer: 'Yes! Contact us for special pricing for educational institutions and registered non-profit organizations. We\'re committed to making practice planning accessible.',
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-gray-300 mx-auto" />
    );
  }
  return <span className="text-gray-600">{value}</span>;
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f6fa] to-white pt-16 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Simple, transparent{' '}
              <span className="text-[#356793]">pricing</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Choose the plan that fits your coaching needs. Start free and upgrade when you&apos;re ready.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-[#356793] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  billingPeriod === 'annual'
                    ? 'bg-[#356793] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <span className="ml-2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl border ${
                  plan.featured
                    ? 'border-[#356793] bg-white shadow-xl ring-2 ring-[#356793]/20'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-[#356793] px-4 py-1 text-sm font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {billingPeriod === 'annual' ? plan.annualPrice : plan.price}
                    </span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  {billingPeriod === 'annual' && plan.price !== '$0' && (
                    <p className="mt-1 text-sm text-gray-500">
                      <span className="line-through">{plan.price}</span>
                      <span className="ml-2 text-green-600">billed annually</span>
                    </p>
                  )}
                  <p className="mt-4 text-sm text-gray-600">{plan.description}</p>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-3 text-sm text-gray-600">
                      <Check className="h-5 w-5 text-[#356793] shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`mt-8 flex h-12 w-full items-center justify-center rounded-lg text-base font-semibold transition-colors ${
                    plan.featured
                      ? 'bg-[#356793] text-white hover:bg-[#2a5276]'
                      : 'border-2 border-gray-200 text-gray-700 hover:border-[#356793] hover:text-[#356793]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Compare All Features</h2>
            <p className="mt-4 text-lg text-gray-600">
              Detailed breakdown of what&apos;s included in each plan.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm sticky top-0">
              <div></div>
              <div className="text-center">Free</div>
              <div className="text-center text-[#356793]">Coach</div>
              <div className="text-center text-[#2a5276]">Organization</div>
            </div>

            {/* Categories */}
            {comparisonData.map((category) => (
              <div key={category.category}>
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 border-t border-gray-200">
                  <div className="font-semibold text-gray-900 col-span-4">{category.category}</div>
                </div>
                {category.features.map((row, index) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-4 gap-4 p-4 text-sm ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-gray-700">
                      {row.feature}
                      {row.tooltip && (
                        <span className="group relative">
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {row.tooltip}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="text-center">
                      <FeatureValue value={row.free} />
                    </div>
                    <div className="text-center">
                      <FeatureValue value={row.coach} />
                    </div>
                    <div className="text-center">
                      <FeatureValue value={row.organization} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-xl bg-gray-50 border border-gray-100"
              >
                <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#356793]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of coaches planning better practices. Start your free trial today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-[#356793] hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-white/30 px-8 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
