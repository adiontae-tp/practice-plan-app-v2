'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  FileText,
  FolderOpen,
  LayoutGrid,
  Share2,
  Smartphone,
  Tag,
  Clock,
  Users,
  BarChart3,
  Bell,
  Lock,
  ArrowRight,
  CheckCircle2,
  Layers,
  Repeat,
  QrCode,
  History,
  Link2,
  Building2,
  Palette,
  Shield,
  Headphones,
  GripVertical,
  Eye,
  Download,
  Upload,
  FolderTree,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

interface FeatureSection {
  id: string;
  title: string;
  description: string;
  color: string;
  features: {
    icon: React.ElementType;
    title: string;
    description: string;
    badge?: string;
  }[];
}

const featureSections: FeatureSection[] = [
  {
    id: 'core-planning',
    title: 'Core Planning Features',
    description: 'Everything you need to create professional practice plans quickly and efficiently.',
    color: '#356793',
    features: [
      {
        icon: Calendar,
        title: 'Visual Calendar',
        description: 'Full calendar view with month and week display. See your entire practice schedule at a glance.',
      },
      {
        icon: GripVertical,
        title: 'Drag & Drop Builder',
        description: 'Build practices visually. Drag periods, adjust times, and reorder activities with ease.',
      },
      {
        icon: Clock,
        title: 'Time-Block Planning',
        description: 'Set precise durations for each activity. Allocate exact minutes to every drill and period.',
      },
      {
        icon: Layers,
        title: 'Period & Drill Library',
        description: 'Create reusable drills and blocks. Save your best activities and use them across all plans.',
      },
      {
        icon: Repeat,
        title: 'Practice Templates',
        description: 'Save complete practice layouts as templates. Reuse them with a single click to save hours.',
        badge: 'Coach+',
      },
      {
        icon: Tag,
        title: 'Smart Tags',
        description: 'Categorize and filter activities by skill, intensity, or custom categories.',
        badge: 'Coach+',
      },
    ],
  },
  {
    id: 'pdf-sharing',
    title: 'PDF & Sharing',
    description: 'Generate professional documents and share plans instantly with your coaching staff.',
    color: '#E78128',
    features: [
      {
        icon: FileText,
        title: 'Multiple PDF Templates',
        description: 'Choose from Standard, Compact, or Detailed layouts to match your preferences.',
        badge: 'Coach+',
      },
      {
        icon: Palette,
        title: 'Team Branding on PDFs',
        description: 'Add your team logo, colors, and coach information to every PDF you generate.',
        badge: 'Coach+',
      },
      {
        icon: Link2,
        title: 'Instant Plan Sharing',
        description: 'Generate secure shareable links. Anyone with the link can view your practice plan.',
      },
      {
        icon: QrCode,
        title: 'QR Codes',
        description: 'Each shared plan includes a QR code for easy mobile access on the field.',
      },
    ],
  },
  {
    id: 'file-management',
    title: 'File Management',
    description: 'Store, organize, and share all your coaching resources in one secure location.',
    color: '#348352',
    features: [
      {
        icon: Upload,
        title: 'File Storage',
        description: 'Upload playbooks, rosters, schedules, and media files. Keep everything in one place.',
        badge: 'Coach+',
      },
      {
        icon: FolderTree,
        title: 'Folder Organization',
        description: 'Create nested folder structures. Organize files the way that makes sense for your team.',
        badge: 'Coach+',
      },
      {
        icon: History,
        title: 'Version History',
        description: 'Track and restore previous file versions. Never lose important changes.',
        badge: 'Coach+',
      },
      {
        icon: Share2,
        title: 'File Sharing',
        description: 'Share files with permissions and expiration dates. Control who can access what.',
        badge: 'Coach+',
      },
    ],
  },
  {
    id: 'team-collaboration',
    title: 'Team Collaboration',
    description: 'Work together with your coaching staff and keep everyone on the same page.',
    color: '#EF7B8F',
    features: [
      {
        icon: UserPlus,
        title: 'Multi-Coach Access',
        description: 'Invite assistant coaches to your team. Up to 5 on Coach plan, unlimited on Organization.',
        badge: 'Coach+',
      },
      {
        icon: Shield,
        title: 'Permission Levels',
        description: 'Assign Admin, Edit, or View-only roles. Control who can modify plans and settings.',
      },
      {
        icon: Bell,
        title: 'Team Announcements',
        description: 'Communicate with your entire coaching staff. Post updates everyone needs to see.',
        badge: 'Coach+',
      },
      {
        icon: Eye,
        title: 'Read Tracking',
        description: 'See who has read your announcements. Know your staff is informed.',
        badge: 'Coach+',
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    description: 'Gain insights into how you spend practice time and optimize your training.',
    color: '#356793',
    features: [
      {
        icon: BarChart3,
        title: 'Practice Statistics',
        description: 'Track total practice hours, plans created, and time allocated per activity type.',
        badge: 'Coach+',
      },
      {
        icon: Layers,
        title: 'Period Usage Analysis',
        description: 'See which drills are used most frequently. Identify your go-to activities.',
        badge: 'Coach+',
      },
      {
        icon: Tag,
        title: 'Tag Usage Reports',
        description: 'Track activity types over time. Ensure balanced skill development.',
        badge: 'Coach+',
      },
      {
        icon: Calendar,
        title: 'Date Range Filtering',
        description: 'Analyze data by week, month, quarter, or year. Spot trends and patterns.',
        badge: 'Coach+',
      },
    ],
  },
  {
    id: 'organization',
    title: 'Organization Features',
    description: 'Manage multiple teams and standardize coaching across your entire program.',
    color: '#2a5276',
    features: [
      {
        icon: Building2,
        title: 'Unlimited Teams',
        description: 'Manage all your teams in one place. No limits on the number of teams you can create.',
        badge: 'Organization',
      },
      {
        icon: FolderOpen,
        title: 'Shared Template Library',
        description: 'Share templates across all teams in your organization. Ensure consistency.',
        badge: 'Organization',
      },
      {
        icon: Palette,
        title: 'Custom Team Branding',
        description: 'Set custom colors, logos, and fonts for each team. Professional appearance.',
        badge: 'Organization',
      },
      {
        icon: LayoutGrid,
        title: 'Organization Dashboard',
        description: 'Overview of all teams, coaches, and activity across your program.',
        badge: 'Organization',
      },
      {
        icon: Users,
        title: 'Unlimited Coaches',
        description: 'Add as many coaches as you need across all teams. No per-seat limits.',
        badge: 'Organization',
      },
      {
        icon: Headphones,
        title: 'Priority Support',
        description: 'Get faster response times and dedicated support for your organization.',
        badge: 'Organization',
      },
    ],
  },
];

const additionalFeatures = [
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Access plans on the field with our iOS and Android apps. Works offline when you need it.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Your data is encrypted and secure. You control who has access to your team\'s information.',
  },
  {
    icon: Download,
    title: 'Data Export',
    description: 'Export your data anytime. Your plans and information always belong to you.',
  },
];

export default function FeaturesPage() {
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
            <span className="inline-block rounded-full bg-[#356793]/10 px-4 py-1.5 text-sm font-medium text-[#356793] mb-4">
              Complete Feature Set
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Everything you need to plan{' '}
              <span className="text-[#356793]">better practices</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              PracticePlan gives you all the tools to create, organize, and share professional practice plans.
              From quick daily planning to season-long curriculum development.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[#356793] px-8 text-base font-semibold text-white shadow-lg shadow-[#356793]/25 hover:bg-[#2a5276] transition-all"
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
        </div>
      </section>

      {/* Feature Sections */}
      {featureSections.map((section, sectionIndex) => (
        <section
          key={section.id}
          id={section.id}
          className={`py-16 lg:py-24 ${sectionIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900">{section.title}</h2>
              <p className="mt-4 text-lg text-gray-600">{section.description}</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {section.features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="relative p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-shadow"
                >
                  {feature.badge && (
                    <span
                      className="absolute top-4 right-4 text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${section.color}15`,
                        color: section.color,
                      }}
                    >
                      {feature.badge}
                    </span>
                  )}
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${section.color}15` }}
                  >
                    <feature.icon className="h-6 w-6" style={{ color: section.color }} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Additional Features */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Plus Everything You&apos;d Expect</h2>
            <p className="mt-4 text-lg text-gray-600">
              The fundamentals are covered on every plan.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <feature.icon className="h-7 w-7 text-gray-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Summary */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Feature Availability</h2>
            <p className="mt-4 text-lg text-gray-600">
              See what&apos;s included in each plan at a glance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm">
              <div>Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center text-[#356793]">Coach</div>
              <div className="text-center text-[#2a5276]">Organization</div>
            </div>
            {[
              { name: 'Practice Plans', free: 'Unlimited', coach: 'Unlimited', org: 'Unlimited' },
              { name: 'Teams', free: '1', coach: '1', org: 'Unlimited' },
              { name: 'Assistant Coaches', free: '0', coach: '5', org: 'Unlimited' },
              { name: 'PDF Export', free: false, coach: true, org: true },
              { name: 'Practice Templates', free: false, coach: true, org: true },
              { name: 'Smart Tags', free: false, coach: true, org: true },
              { name: 'File Storage', free: '—', coach: '10 GB', org: '50 GB' },
              { name: 'File Versions', free: '—', coach: '10', org: '50' },
              { name: 'Team Announcements', free: false, coach: true, org: true },
              { name: 'Analytics Dashboard', free: false, coach: true, org: true },
              { name: 'Org Dashboard', free: false, coach: false, org: true },
              { name: 'Shared Templates', free: false, coach: false, org: true },
              { name: 'Custom Branding', free: false, coach: false, org: true },
              { name: 'Priority Support', free: false, coach: false, org: true },
            ].map((row, index) => (
              <div
                key={row.name}
                className={`grid grid-cols-4 gap-4 p-4 text-sm ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{row.name}</div>
                <div className="text-center">
                  {typeof row.free === 'boolean' ? (
                    row.free ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )
                  ) : (
                    <span className="text-gray-600">{row.free}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof row.coach === 'boolean' ? (
                    row.coach ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )
                  ) : (
                    <span className="text-gray-600">{row.coach}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof row.org === 'boolean' ? (
                    row.org ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )
                  ) : (
                    <span className="text-gray-600">{row.org}</span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>

          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center text-[#356793] font-semibold hover:underline"
            >
              View full pricing details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#356793]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to transform your practice planning?</h2>
          <p className="mt-4 text-lg text-blue-100">Start your free trial today. No credit card required.</p>
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
