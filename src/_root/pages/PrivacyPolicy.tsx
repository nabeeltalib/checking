import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, Mail } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'information-we-collect', title: 'Information We Collect' },
    { id: 'how-we-use', title: 'How We Use Your Information' },
    { id: 'sharing', title: 'Sharing of Your Information' },
    { id: 'rights', title: 'Your Rights and Choices' },
    { id: 'security', title: 'Data Security' },
    { id: 'transfers', title: 'International Data Transfers' },
    { id: 'children', title: "Children's Privacy" },
    { id: 'changes', title: 'Changes to This Privacy Policy' },
    { id: 'contact', title: 'Contact Us' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-dark-1 text-light-2 min-h-screen p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-primary-500 mb-6">Topfived Privacy Policy</h1>
        <p className="text-light-3 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-xl font-semibold mb-4 text-light-1">Table of Contents</h2>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-primary-500 hover:text-primary-600 transition-colors"
                      onClick={() => setActiveSection(section.id)}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-2 space-y-12">
            <motion.section id="introduction" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to Topfived ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application (collectively, the "Platform").
              </p>
            </motion.section>

            <motion.section id="information-we-collect" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">2. Information We Collect</h2>
              <p className="mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Personal information (e.g., name, email address, profile data)</li>
                <li>Content you create (e.g., lists, comments, votes)</li>
                <li>Communications you have with us</li>
              </ul>
              <p className="mb-4">We also automatically collect certain information when you use the Platform, including:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Usage data (e.g., pages visited, features used)</li>
                <li>Device information (e.g., IP address, browser type, operating system)</li>
              </ul>
            </motion.section>

            <motion.section id="how-we-use" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide and maintain the Platform</li>
                <li>Personalize your experience</li>
                <li>Communicate with you about the Platform</li>
                <li>Analyze usage of the Platform</li>
                <li>Enforce our terms, conditions, and policies</li>
                <li>Respond to legal requests and prevent harm</li>
              </ul>
            </motion.section>

            <motion.section id="sharing" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">4. Sharing of Your Information</h2>
              <p className="mb-4">We may share your information with:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Service providers who help us operate the Platform</li>
                <li>Other users, as part of the normal operation of the Platform (e.g., public lists)</li>
                <li>Legal authorities when required by law or to protect our rights</li>
              </ul>
            </motion.section>

            <motion.section id="rights" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">5. Your Rights and Choices</h2>
              <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information, including:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion of your data</li>
                <li>Objection to certain processing activities</li>
                <li>Data portability</li>
              </ul>
            </motion.section>

            <motion.section id="security" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">6. Data Security</h2>
              <p className="mb-4">We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.</p>
            </motion.section>

            <motion.section id="transfers" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">7. International Data Transfers</h2>
              <p className="mb-4">Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, in compliance with applicable data protection laws.</p>
            </motion.section>

            <motion.section id="children" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">8. Children's Privacy</h2>
              <p className="mb-4">The Platform is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us so we can take steps to remove such information.</p>
            </motion.section>

            <motion.section id="changes" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">9. Changes to This Privacy Policy</h2>
              <p className="mb-4">We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.</p>
            </motion.section>

            <motion.section id="contact" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">10. Contact Us</h2>
              <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at:</p>
              <p className="flex items-center gap-2">
                <Mail className="text-primary-500" />
                <a href="mailto:privacy@topfived.com" className="text-primary-500 hover:underline">privacy@topfived.com</a>
              </p>
            </motion.section>
          </div>
        </div>

        <motion.button
          className="fixed bottom-8 right-8 bg-primary-500 text-white p-3 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
          onClick={scrollToTop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronUp size={24} />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;