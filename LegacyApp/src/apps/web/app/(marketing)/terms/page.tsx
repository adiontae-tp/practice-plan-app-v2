'use client';

import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function TermsPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f6fa] to-white pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Last updated: December 1, 2024
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-6">
              By accessing or using PracticePlan, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-6">
              PracticePlan provides a practice planning platform for coaches and athletic directors.
              Our service includes web and mobile applications for creating, organizing, and sharing
              practice plans.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">To use our services, you must:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Be at least 18 years old or have parental consent</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-600 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Upload malicious code or attempt to breach security</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Interfere with the proper working of the service</li>
              <li>Scrape or collect user data without consent</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Content Ownership</h2>
            <p className="text-gray-600 mb-6">
              You retain ownership of all content you create on PracticePlan. By using our service,
              you grant us a license to host, store, and display your content as necessary to provide
              the service. We do not claim ownership of your practice plans or other content.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Subscription and Billing</h2>
            <p className="text-gray-600 mb-6">
              Paid subscriptions are billed in advance on a monthly or annual basis. You may cancel
              your subscription at any time, and you will continue to have access until the end of
              your current billing period. Refunds are handled on a case-by-case basis.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Termination</h2>
            <p className="text-gray-600 mb-6">
              We may suspend or terminate your account if you violate these terms. You may delete
              your account at any time. Upon termination, your right to use the service will immediately cease.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-600 mb-6">
              The service is provided "as is" without warranties of any kind, either express or implied.
              We do not guarantee that the service will be uninterrupted, secure, or error-free.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-600 mb-6">
              In no event shall PracticePlan be liable for any indirect, incidental, special, consequential,
              or punitive damages arising out of or related to your use of the service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-600 mb-6">
              We reserve the right to modify these terms at any time. We will notify users of significant
              changes via email or through the service. Continued use after changes constitutes acceptance.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Contact</h2>
            <p className="text-gray-600 mb-6">
              For questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@practiceplanapp.com" className="text-[#356793] hover:underline">
                legal@practiceplanapp.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
