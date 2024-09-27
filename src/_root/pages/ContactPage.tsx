import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, HelpCircle, Mail, MessageCircle, AlertTriangle, FileText, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', category: '', message: '' });
  };

  const categories = [
    { value: 'general', label: 'General Inquiry', icon: <HelpCircle size={18} /> },
    { value: 'technical', label: 'Technical Support', icon: <AlertTriangle size={18} /> },
    { value: 'feedback', label: 'Feedback', icon: <MessageCircle size={18} /> },
    { value: 'business', label: 'Business Inquiry', icon: <FileText size={18} /> }
  ];

  const faqs = [
    { question: "How do I create a list?", answer: "To create a list, log in to your account, click on the 'Create List' button in the top right corner, and follow the prompts to add your items and publish your list." },
    { question: "Can I edit my list after publishing?", answer: "Yes, you can edit your list at any time. Simply go to your profile, find the list you want to edit, and click the 'Edit' button." },
    { question: "How do I report inappropriate content?", answer: "If you come across any inappropriate content, please use the 'Report' button located next to each list or comment. Our moderation team will review it promptly." }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 rounded-lg shadow-lg bg-gray-800 text-white"
    >
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">Contact Us</h1>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-12 text-center"
      >
        <p className="text-lg mb-6">We're here to help! Send us a message and we'll get back to you as soon as possible.</p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/helpfaqpage" className="text-blue-400 hover:text-blue-300 flex items-center bg-gray-700 px-4 py-2 rounded-full transition-colors duration-300">
            <HelpCircle size={20} className="mr-2" /> Check our FAQ
          </Link>
          <a href="mailto:support@topfived.com" className="text-blue-400 hover:text-blue-300 flex items-center bg-gray-700 px-4 py-2 rounded-full transition-colors duration-300">
            <Mail size={20} className="mr-2" /> Email Us Directly
          </a>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-green-800 text-green-100 p-6 rounded-lg mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">Thank you for your message!</h2>
            <p className="text-lg">We've received your inquiry and will respond as soon as possible.</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {['name', 'email'].map((field) => (
              <motion.div key={field} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-300 mb-2">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  id={field}
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </motion.div>
            ))}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}                                
                spellCheck={true} // Enable spellcheck here
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              ></textarea>
            </motion.div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Send size={20} className="mr-2" /> Send Message
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-16 bg-gray-700 p-6 rounded-lg"
      >
        <h2 className="text-2xl font-semibold mb-6 text-blue-400">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.details
              key={index}
              initial={false}
              animate={activeCategory === `faq-${index}` ? { backgroundColor: "rgba(59, 130, 246, 0.1)" } : { backgroundColor: "rgba(0, 0, 0, 0)" }}
              className="cursor-pointer rounded-lg p-4 transition-colors duration-300"
            >
              <summary 
                className="font-medium flex justify-between items-center"
                onClick={() => setActiveCategory(activeCategory === `faq-${index}` ? null : `faq-${index}`)}
              >
                {faq.question}
                <ChevronDown 
                  size={20}
                  className={`transform transition-transform duration-300 ${activeCategory === `faq-${index}` ? 'rotate-180' : ''}`}
                />
              </summary>
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-gray-300"
              >
                {faq.answer}
              </motion.p>
            </motion.details>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactPage;