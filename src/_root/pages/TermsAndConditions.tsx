import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, Mail } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    { id: 'agreement', title: 'Agreement to Terms' },
    { id: 'intellectual-property', title: 'Intellectual Property Rights' },
    { id: 'user-accounts', title: 'User Accounts' },
    { id: 'user-content', title: 'User-Generated Content' },
    { id: 'prohibited-uses', title: 'Prohibited Uses' },
    { id: 'termination', title: 'Termination' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'governing-law', title: 'Governing Law' },
    { id: 'changes', title: 'Changes to Terms' },
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
        <h1 className="text-4xl font-bold text-primary-500 mb-6">Topfived Terms and Conditions</h1>
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
            <motion.section id="agreement" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">1. Agreement to Terms</h2>
              <p className="mb-4">By using our Platform, you agree to be bound by these Terms and Conditions.</p>
            </motion.section>

            <motion.section id="intellectual-property" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">2. Intellectual Property Rights</h2>
              <p className="mb-4">The Platform and its original content, features, and functionality are owned by Topfived and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
            </motion.section>

            <motion.section id="user-accounts" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">3. User Accounts</h2>
              <p className="mb-4">You are responsible for safeguarding the password that you use to access the Platform and for any activities or actions under your password.</p>
            </motion.section>

            <motion.section id="user-content" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">4. User-Generated Content</h2>
              <p className="mb-4">You may post, upload, publish, submit or transmit user-generated content. By making available any user-generated content on or through the Platform, you grant us a worldwide, irrevocable, perpetual, non-exclusive, transferable, royalty-free license to use, sell, reproduce, distribute, modify, adapt, publicly display, and perform the user-generated content.</p>
            </motion.section>

            <motion.section id="prohibited-uses" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">5. Prohibited Uses</h2>
              <p className="mb-4">You may not use the Platform in any way that violates any applicable national or international law or regulation.</p>
            </motion.section>

            <motion.section id="termination" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">6. Termination</h2>
              <p className="mb-4">We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            </motion.section>

            <motion.section id="liability" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">7. Limitation of Liability</h2>
              <p className="mb-4">In no event shall Topfived, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Platform.</p>
            </motion.section>

            <motion.section id="governing-law" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">8. Governing Law</h2>
              <p className="mb-4">These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>
            </motion.section>

            <motion.section id="changes" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">9. Changes to Terms</h2>
              <p className="mb-4">We reserve the right, at our sole discretion, to modify or replace these Terms at any time.</p>
            </motion.section>

            <motion.section id="contact" className="mb-12">
              <h2 className="text-2xl font-semibold text-light-1 mb-4">10. Contact Us</h2>
              <p className="mb-4">If you have any questions about these Terms, please contact us at:</p>
              <p className="flex items-center gap-2">
                <Mail className="text-primary-500" />
                <a href="mailto:terms@topfived.com" className="text-primary-500 hover:underline">terms@topfived.com</a>
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

export default TermsAndConditions;