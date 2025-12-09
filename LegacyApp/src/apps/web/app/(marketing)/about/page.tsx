'use client';

import { motion } from 'framer-motion';
import { Heart, Target, Users, Zap } from 'lucide-react';
import Link from 'next/link';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const values = [
  {
    icon: Heart,
    title: 'Coach-First Design',
    description: 'Every feature is built with coaches in mind. We understand the challenges you face because we\'ve been there.',
  },
  {
    icon: Target,
    title: 'Focused on Impact',
    description: 'We believe better-planned practices lead to better-developed athletes. That\'s the impact we strive for.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Our product roadmap is shaped by feedback from coaches like you. We build what you need.',
  },
  {
    icon: Zap,
    title: 'Simple & Effective',
    description: 'No complexity for complexity\'s sake. We keep things simple so you can focus on coaching.',
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f6fa] to-white pt-16 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              We're on a mission to help coaches{' '}
              <span className="text-[#356793]">plan smarter</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              PracticePlan was born from the frustration of spending too much time planning and not enough time coaching.
              We believe every coach deserves tools that make practice planning effortless.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
              <div className="mt-6 space-y-4 text-gray-600">
                <p>
                  PracticePlan started when a group of coaches realized they were all facing the same problem:
                  spending hours creating practice plans on paper or in spreadsheets, only to lose them or struggle to share them with staff.
                </p>
                <p>
                  We knew there had to be a better way. So we built PracticePlan - a simple, powerful tool that helps
                  coaches create professional practice plans in minutes, not hours.
                </p>
                <p>
                  Today, thousands of coaches trust PracticePlan to help them prepare for practice. From youth leagues
                  to college programs, we're proud to support coaches at every level.
                </p>
              </div>
            </div>
            <div className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Team Photo</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#356793]/10 text-[#356793]">
                  <value.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{value.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#356793]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Join thousands of coaches using PracticePlan</h2>
          <p className="mt-4 text-lg text-blue-100">Start planning better practices today.</p>
          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-[#356793] hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
