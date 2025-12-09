'use client';

import { motion } from 'framer-motion';
import {
  Check,
  ArrowRight,
  Clock,
  Target,
  Users,
  Smartphone,
  FileText,
  Calendar,
  FolderOpen,
  Share2,
  BarChart3,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const benefits = [
  {
    icon: Clock,
    title: 'Save Hours Every Week',
    description:
      'Stop spending evenings planning practices. Create professional plans in minutes with templates and drag-and-drop tools.',
  },
  {
    icon: Target,
    title: 'Stay Organized',
    description:
      'Keep all your drills, plans, and resources in one place. Find what you need instantly with smart search and tags.',
  },
  {
    icon: Users,
    title: 'Coordinate with Staff',
    description:
      "Share plans with assistant coaches instantly. Everyone knows what's happening at practice.",
  },
  {
    icon: Smartphone,
    title: 'Access Anywhere',
    description:
      "Pull up your plan on the field with our mobile app. Works offline so you're never left without your plan.",
  },
];

const features = [
  {
    icon: Calendar,
    title: 'Visual Calendar',
    description: 'See your entire season at a glance. Plan ahead and never miss a practice.',
  },
  {
    icon: FileText,
    title: 'PDF Export',
    description: 'Generate professional PDFs with your team branding. Print or share digitally.',
  },
  {
    icon: FolderOpen,
    title: 'File Storage',
    description: '10GB of storage for playbooks, videos, and resources. All organized and accessible.',
  },
  {
    icon: Share2,
    title: 'Instant Sharing',
    description: 'Share plans via link or QR code. Your staff sees updates in real-time.',
  },
  {
    icon: BarChart3,
    title: 'Practice Analytics',
    description: 'Track how you spend practice time. Identify patterns and optimize training.',
  },
  {
    icon: Tag,
    title: 'Smart Tags',
    description: 'Categorize drills by skill, intensity, or any custom tag. Find what you need fast.',
  },
];

const pricingHighlights = [
  'Unlimited practice plans',
  'Practice templates',
  'PDF export with branding',
  '10GB file storage',
  'Up to 5 assistant coaches',
  'Analytics dashboard',
  'Mobile app access',
  'Team announcements',
];

export default function CoachesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f6fa] to-white pt-16 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#356793]/10 px-4 py-1.5 text-sm font-medium text-[#356793]">
                For Coaches
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Plan practices like a pro,{' '}
                <span className="text-[#356793]">coach like a champion</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                Whether you coach youth sports or varsity athletics, PracticePlan helps you create
                structured, effective practices that develop athletes and win games.
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
                  href="/pricing"
                  className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-gray-200 bg-white px-8 text-base font-semibold text-gray-700 hover:border-[#356793] hover:text-[#356793] transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl bg-white p-2 shadow-2xl overflow-hidden">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src="/screenshots/plan-detail.png"
                    alt="Practice Plan Detail"
                    fill
                    className="object-cover rounded-xl"
                    unoptimized
                    onError={(e) => {
                      // Hide image on error, fallback will show
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {/* Fallback mockup */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#356793] to-[#2a5276] p-6 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Today&apos;s Practice</p>
                            <p className="text-white/70 text-sm">90 minutes • Basketball</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-green-400/20 text-green-300 text-sm font-medium">
                          Ready
                        </span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { name: 'Warm Up & Dynamic Stretching', time: '15 min', tag: 'Warmup' },
                          { name: 'Ball Handling Drills', time: '20 min', tag: 'Skills' },
                          { name: '3v3 Half Court', time: '25 min', tag: 'Scrimmage' },
                          { name: 'Free Throw Shooting', time: '15 min', tag: 'Shooting' },
                          { name: 'Cool Down & Review', time: '15 min', tag: 'Cooldown' },
                        ].map((activity, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="flex items-center gap-3 rounded-lg bg-white/10 p-3"
                          >
                            <span className="text-white flex-1 text-sm">{activity.name}</span>
                            <span className="text-white/60 text-xs px-2 py-0.5 rounded bg-white/10">
                              {activity.tag}
                            </span>
                            <span className="text-white/60 text-sm">{activity.time}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
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
            <h2 className="text-3xl font-bold text-gray-900">Why coaches love PracticePlan</h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of coaches who are saving time and developing better athletes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-shadow"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#356793]/10 text-[#356793]">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="mt-2 text-gray-600">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Features built for coaches</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to plan, share, and track your practices.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-2xl border border-gray-100 bg-white"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#356793]/10 text-[#356793]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/features"
              className="inline-flex items-center text-[#356793] font-semibold hover:underline"
            >
              View all features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E78128]/10 px-4 py-1.5 text-sm font-medium text-[#E78128]">
                Coach Plan
              </span>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                Everything you need for{' '}
                <span className="text-[#356793]">$2.49/month</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Get full access to all coaching features. Start with a 14-day free trial—no credit
                card required.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-3">
                {pricingHighlights.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-600">
                    <Check className="h-5 w-5 text-[#348352]" />
                    <span className="text-sm">{item}</span>
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
              <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Coach Plan</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900">$2.49</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">or $1.99/month billed annually</p>
                </div>
                <div className="p-4 rounded-lg bg-[#356793]/5 border border-[#356793]/20">
                  <p className="text-sm text-center text-[#356793] font-medium">
                    Start your 14-day free trial today
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#356793]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to level up your coaching?</h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of coaches who plan smarter with PracticePlan.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-[#356793] hover:bg-gray-100 transition-colors"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
