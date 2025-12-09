'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Users,
  BarChart3,
  Shield,
  FolderOpen,
  Bell,
  Check,
  Palette,
  LayoutGrid,
  Headphones,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const benefits = [
  {
    icon: Building2,
    title: 'Manage Unlimited Teams',
    description:
      'Oversee practice planning across all your programs from a single dashboard. See what every team is working on.',
  },
  {
    icon: Users,
    title: 'Unlimited Coaches',
    description:
      'Add as many coaches as you need across all teams. No per-seat limits or hidden fees.',
  },
  {
    icon: FolderOpen,
    title: 'Shared Template Library',
    description:
      'Create a centralized library of practice templates. Share approved drills across all programs.',
  },
  {
    icon: Palette,
    title: 'Custom Team Branding',
    description:
      'Set custom colors, logos, and fonts for each team. Every PDF looks professional and on-brand.',
  },
  {
    icon: LayoutGrid,
    title: 'Organization Dashboard',
    description:
      'Get a bird\'s-eye view of all teams. See practice schedules, coach activity, and program health.',
  },
  {
    icon: Shield,
    title: 'Permission Controls',
    description:
      'Control who can access what. Set up roles for head coaches, assistants, and administrators.',
  },
];

const orgFeatures = [
  {
    title: 'Everything coaches need, plus organization-wide tools',
    features: [
      'Unlimited teams in one account',
      'Unlimited coaches across all teams',
      '50GB file storage for the organization',
      '50 file versions for complete history',
      'Shared template library across teams',
      'Custom branding per team',
      'Organization-wide announcements',
      'Centralized billing and management',
    ],
  },
];

const useCases = [
  {
    title: 'School Athletic Departments',
    description:
      'Manage practice planning across all sports programs. Ensure every coach has the tools they need while maintaining curriculum standards.',
    icon: Building2,
  },
  {
    title: 'Club Sports Organizations',
    description:
      'Coordinate multiple teams and age groups. Share best practices across coaches and ensure consistent training quality.',
    icon: Users,
  },
  {
    title: 'Multi-Sport Facilities',
    description:
      'Oversee diverse programs from a single dashboard. Track facility usage and optimize practice schedules.',
    icon: LayoutGrid,
  },
];

const pricingHighlights = [
  'Everything in Coach plan',
  'Unlimited teams',
  'Unlimited coaches',
  '50GB file storage',
  '50 file versions',
  'Shared template library',
  'Custom team branding',
  'Organization dashboard',
  'Priority support',
];

export default function DirectorsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f6fa] to-white pt-16 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#356793]/10 px-4 py-1.5 text-sm font-medium text-[#356793]">
                For Athletic Directors
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Elevate your entire{' '}
                <span className="text-[#356793]">athletic program</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                Give every coach in your organization the tools to plan professional practices.
                Maintain oversight, ensure quality, and build a culture of excellence.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-[#356793] px-8 text-base font-semibold text-white shadow-lg hover:bg-[#2a5276] transition-colors"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-gray-200 bg-white px-8 text-base font-semibold text-gray-700 hover:border-[#356793] hover:text-[#356793] transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Organization Dashboard</h3>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#356793]/10 text-[#356793]">
                    Organization Plan
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Teams', value: '12' },
                    { label: 'Coaches', value: '34' },
                    { label: 'Plans This Week', value: '28' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-lg bg-gray-50">
                      <p className="text-2xl font-bold text-[#356793]">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { team: 'Varsity Basketball', coach: 'Coach Thompson', status: 'Active' },
                    { team: 'JV Soccer', coach: 'Coach Martinez', status: 'Active' },
                    { team: 'Varsity Football', coach: 'Coach Williams', status: 'Scheduled' },
                    { team: 'Swim Team', coach: 'Coach Johnson', status: 'Active' },
                  ].map((team, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{team.team}</p>
                        <p className="text-xs text-gray-500">{team.coach}</p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          team.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {team.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Built for program-wide success</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to manage practice planning across your organization.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#356793]/10 text-[#356793]">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{benefit.title}</h3>
                <p className="mt-2 text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Perfect for every organization</h2>
            <p className="mt-4 text-lg text-gray-600">
              Whether you manage a school athletic department or a multi-sport club.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white border border-gray-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E78128]/10 text-[#E78128]">
                  <useCase.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{useCase.title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#2a5276]/10 px-4 py-1.5 text-sm font-medium text-[#2a5276]">
                Organization Plan
              </span>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                Everything included for{' '}
                <span className="text-[#356793]">$14.99/month</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Full organization-wide access. One simple price, unlimited teams and coaches.
              </p>
              <ul className="mt-6 space-y-3">
                {pricingHighlights.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-600">
                    <Check className="h-5 w-5 text-[#348352]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-4">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-[#356793] px-8 text-base font-semibold text-white hover:bg-[#2a5276] transition-colors"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-gray-200 bg-white px-8 text-base font-semibold text-gray-700 hover:border-[#356793] hover:text-[#356793] transition-colors"
                >
                  Compare Plans
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl bg-gradient-to-br from-[#356793] to-[#2a5276] p-8 text-white">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold">Organization Plan</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">$14.99</span>
                    <span className="text-white/70">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-white/70">or $11.99/month billed annually</p>
                </div>
                <div className="p-4 rounded-lg bg-white/10">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Headphones className="h-4 w-4" />
                    <span>Priority support included</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-sm text-white/80 text-center">
                    Need a custom solution? <Link href="/contact" className="underline hover:text-white">Contact sales</Link> for enterprise pricing.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#348352]/10">
                <Headphones className="h-7 w-7 text-[#348352]" />
              </div>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">Priority support when you need it</h2>
              <p className="mt-4 text-lg text-gray-600">
                Organization plan includes priority support with faster response times. Get help
                onboarding your coaches, setting up your structure, and maximizing your investment.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Priority email support',
                  'Onboarding assistance',
                  'Coach training resources',
                  'Dedicated success manager for large organizations',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-600">
                    <Check className="h-5 w-5 text-[#348352]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900">Questions about Organization plans?</h3>
              <p className="mt-2 text-gray-600">
                Our team is happy to walk you through the platform and discuss how PracticePlan
                can work for your specific needs.
              </p>
              <div className="mt-6 flex gap-4">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-[#356793] px-6 text-base font-semibold text-white hover:bg-[#2a5276] transition-colors"
                >
                  Schedule a Demo
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-gray-200 bg-white px-6 text-base font-semibold text-gray-700 hover:border-[#356793] hover:text-[#356793] transition-colors"
                >
                  Try It Free
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#356793]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to transform your athletic program?</h2>
          <p className="mt-4 text-lg text-blue-100">
            Schedule a demo to see how PracticePlan works for organizations.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-[#356793] hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-white px-8 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
