"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  FileText,
  FolderOpen,
  LayoutGrid,
  Share2,
  Smartphone,
  Tag,
  Check,
  ArrowRight,
  Play
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f6fa] to-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#356793]/5 blur-3xl" />
          <div className="absolute top-60 -left-40 h-80 w-80 rounded-full bg-[#EF7B8F]/5 blur-3xl" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
              >
                Plan practices in{" "}
                <span className="text-[#356793]">minutes</span>, not hours
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="mt-6 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0"
              >
                The complete practice planning platform for coaches and athletic directors. 
                Build professional practice plans, share instantly with your staff, and track 
                athlete development—all in one place.
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-[#356793] px-8 text-base font-semibold text-white shadow-lg shadow-[#356793]/25 hover:bg-[#2a5276] transition-all hover:shadow-xl hover:shadow-[#356793]/30"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-gray-200 bg-white px-8 text-base font-semibold text-gray-700 hover:border-[#356793] hover:text-[#356793] transition-colors"
                >
                  <Play className="mr-2 h-5 w-5" />
                  See How It Works
                </Link>
              </motion.div>

            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-2xl bg-white p-2 shadow-2xl shadow-gray-200/50 ring-1 ring-gray-100 overflow-hidden">
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
                            <p className="text-white/70 text-sm">90 minutes</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-green-400/20 text-green-300 text-sm font-medium">Active</span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { name: "Warm Up & Dynamic Stretching", time: "15 min", color: "bg-[#EF7B8F]" },
                          { name: "Skill Development Drills", time: "25 min", color: "bg-[#E78128]" },
                          { name: "Team Scrimmage", time: "35 min", color: "bg-[#348352]" },
                          { name: "Cool Down & Review", time: "15 min", color: "bg-[#356793]" }
                        ].map((activity, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex items-center gap-3 rounded-lg bg-white/10 p-3"
                          >
                            <div className={`h-2 w-2 rounded-full ${activity.color}`} />
                            <span className="text-white flex-1 text-sm">{activity.name}</span>
                            <span className="text-white/60 text-sm">{activity.time}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-white p-4 shadow-xl ring-1 ring-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Plan Shared!</p>
                    <p className="text-sm text-gray-500">Sent to 3 coaches</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block rounded-full bg-[#356793]/10 px-4 py-1.5 text-sm font-medium text-[#356793] mb-4"
            >
              Powerful Features
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl font-bold text-gray-900"
            >
              Everything you need to run better practices
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg text-gray-600"
            >
              From quick daily plans to season-long curriculum development, we&apos;ve got you covered.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: LayoutGrid,
                title: "Drag & Drop Builder",
                description: "Build practice plans visually. Drag periods, adjust times, and reorder activities with ease.",
                color: "#356793"
              },
              {
                icon: FolderOpen,
                title: "File Management",
                description: "Store playbooks, rosters, and media files. Organize with folders and version history.",
                color: "#E78128"
              },
              {
                icon: FileText,
                title: "PDF Export",
                description: "Generate professional PDF handouts. Share printed plans with your coaching staff.",
                color: "#348352"
              },
              {
                icon: Share2,
                title: "Instant Sharing",
                description: "Share plans with assistant coaches in one tap. Everyone stays on the same page.",
                color: "#EF7B8F"
              },
              {
                icon: Calendar,
                title: "Calendar View",
                description: "See your entire season at a glance. Plan ahead and never miss a practice.",
                color: "#356793"
              },
              {
                icon: Tag,
                title: "Smart Tagging",
                description: "Organize drills by skill, intensity, or any custom tag. Find what you need fast.",
                color: "#E78128"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all"
              >
                <div 
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
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

      {/* For Coaches / For Directors */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* For Coaches */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl bg-white p-8 lg:p-10 shadow-sm border border-gray-100"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#356793]/10 mb-6">
                <LayoutGrid className="h-6 w-6 text-[#356793]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Head Coaches</h3>
              <p className="text-gray-600 mb-6">
                Stop spending hours on paperwork. Create professional practice plans that 
                impress your staff and develop your athletes.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Save 5+ hours per week on planning",
                  "Access your plans from any device",
                  "Share instantly with assistant coaches",
                  "Build a reusable drill library"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#348352]" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/for-coaches"
                className="inline-flex items-center text-[#356793] font-semibold hover:underline"
              >
                Learn more for coaches
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>

            {/* For Directors */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl bg-gradient-to-br from-[#356793] to-[#2a5276] p-8 lg:p-10 text-white"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 mb-6">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Athletic Directors</h3>
              <p className="text-white/80 mb-6">
                Standardize coaching quality across your entire program. Give every coach 
                the tools they need while maintaining oversight.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Manage unlimited teams from one dashboard",
                  "Share approved drills across all coaches",
                  "Track coaching activity and engagement",
                  "Ensure curriculum consistency"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-300" />
                    <span className="text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/directors"
                className="inline-flex items-center text-white font-semibold hover:underline"
              >
                Learn more for directors
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block rounded-full bg-[#E78128]/10 px-4 py-1.5 text-sm font-medium text-[#E78128] mb-4"
            >
              Simple Pricing
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl font-bold text-gray-900"
            >
              Start free, upgrade when ready
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg text-gray-600"
            >
              No credit card required. Try all features free for 14 days.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                description: "Perfect for getting started",
                features: ["1 team", "Basic practice planning", "Period templates"],
                cta: "Get Started",
                popular: false
              },
              {
                name: "Coach",
                price: "$2.49",
                period: "/month",
                description: "For serious coaches",
                features: ["Everything in Free", "PDF export", "Practice templates", "10GB file storage", "Analytics", "5 assistant coaches"],
                cta: "Start Free Trial",
                popular: true
              },
              {
                name: "Organization",
                price: "$14.99",
                period: "/month",
                description: "For schools & clubs",
                features: ["Everything in Coach", "Unlimited teams", "50GB storage", "Org dashboard", "Priority support"],
                cta: "Start Free Trial",
                popular: false
              }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 ${
                  plan.popular 
                    ? "bg-[#356793] text-white ring-4 ring-[#356793]/20" 
                    : "bg-white border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#E78128] px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mt-1 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? "text-white/70" : "text-gray-500"}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <Check className={`h-5 w-5 ${plan.popular ? "text-green-300" : "text-[#348352]"}`} />
                      <span className={plan.popular ? "text-white/90" : "text-gray-600"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? "bg-white text-[#356793] hover:bg-gray-100"
                      : "bg-[#356793] text-white hover:bg-[#2a5276]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center text-[#356793] font-semibold hover:underline"
            >
              Compare all plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block rounded-full bg-[#EF7B8F]/10 px-4 py-1.5 text-sm font-medium text-[#EF7B8F] mb-4">
                Mobile App
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Take your plans to the field
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Access your practice plans anywhere with our iOS and Android apps. 
                Edit on the fly, share updates instantly, and never be caught without a plan.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Works offline - no wifi needed",
                  "Edit plans in real-time",
                  "Quick share to coaching staff",
                  "Timer and stopwatch built-in"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#356793]/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-[#356793]" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-4">
                <Link href="#" className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </Link>
                <Link href="#" className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative mx-auto w-64 h-[500px] rounded-[3rem] bg-gray-900 p-3 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-gray-800">
                  <Image
                    src="/screenshots/mobile-practice-plan.png"
                    alt="Mobile Practice Plan"
                    fill
                    className="object-cover rounded-[2.5rem]"
                    unoptimized
                    onError={(e) => {
                      // Hide image on error, fallback will show
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {/* Fallback mockup */}
                  <div className="absolute inset-0 h-full w-full rounded-[2.5rem] bg-gradient-to-br from-[#356793] to-[#2a5276] p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-white font-semibold">Practice Plan</div>
                      <Smartphone className="h-5 w-5 text-white/50" />
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: "Warm Up", time: "15 min" },
                        { name: "Passing Drills", time: "20 min" },
                        { name: "5v5 Scrimmage", time: "30 min" },
                        { name: "Set Pieces", time: "15 min" },
                        { name: "Cool Down", time: "10 min" }
                      ].map((item, i) => (
                        <div key={i} className="rounded-lg bg-white/10 p-3 flex justify-between items-center">
                          <span className="text-white text-sm">{item.name}</span>
                          <span className="text-white/60 text-xs">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-[#356793]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold text-white mb-6"
          >
            Ready to transform your practices?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of coaches who are saving time and developing better athletes. 
            Start your free trial today—no credit card required.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/register"
              className="inline-flex h-14 items-center justify-center rounded-lg bg-white px-10 text-lg font-semibold text-[#356793] shadow-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
