'use client';

import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const posts = [
  {
    title: '5 Tips for More Effective Practice Planning',
    excerpt: 'Learn how to structure your practices for maximum athlete development and engagement.',
    date: 'December 1, 2024',
    category: 'Planning Tips',
  },
  {
    title: 'How to Keep Athletes Engaged During Practice',
    excerpt: 'Discover strategies to maintain high energy and focus throughout your practice sessions.',
    date: 'November 28, 2024',
    category: 'Coaching',
  },
  {
    title: 'Building a Practice Template Library',
    excerpt: 'Save time by creating reusable templates for different practice scenarios and goals.',
    date: 'November 25, 2024',
    category: 'Productivity',
  },
  {
    title: 'Balancing Skill Development and Competition',
    excerpt: 'Find the right mix of drills and scrimmages to develop well-rounded athletes.',
    date: 'November 20, 2024',
    category: 'Coaching',
  },
  {
    title: 'Using Tags to Organize Your Practice Plans',
    excerpt: 'Learn how to use PracticePlan\'s tag system to quickly find and reuse your best drills.',
    date: 'November 15, 2024',
    category: 'Product Tips',
  },
  {
    title: 'Season Planning: A Month-by-Month Guide',
    excerpt: 'Structure your entire season for progressive skill development and peak performance.',
    date: 'November 10, 2024',
    category: 'Planning Tips',
  },
];

export default function BlogPage() {
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
              The PracticePlan{' '}
              <span className="text-[#356793]">Blog</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Tips, strategies, and insights to help you become a better coach and plan more effective practices.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </div>
                <span className="inline-flex rounded-full bg-[#356793]/10 px-3 py-1 text-xs font-medium text-[#356793]">
                  {post.category}
                </span>
                <h2 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-[#356793] transition-colors">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-gray-600">{post.excerpt}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-[#356793]">
                  Read more
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Stay up to date</h2>
          <p className="mt-4 text-gray-600">
            Get the latest coaching tips and PracticePlan updates delivered to your inbox.
          </p>
          <form className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 px-4 rounded-lg border border-gray-200 focus:border-[#356793] focus:outline-none focus:ring-2 focus:ring-[#356793]/20"
            />
            <button
              type="submit"
              className="h-12 px-6 rounded-lg bg-[#356793] text-white font-semibold hover:bg-[#2a5276] transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
