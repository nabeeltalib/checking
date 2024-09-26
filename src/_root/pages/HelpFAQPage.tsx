import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, Book, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQItem: React.FC<FAQItem> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className="border-b border-gray-700 py-4"
      initial={false}
      animate={{ backgroundColor: isOpen ? "rgba(59, 130, 246, 0.1)" : "rgba(0, 0, 0, 0)" }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        className="flex justify-between items-center w-full text-left text-lg font-medium text-blue-400"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{question}</span>
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="mt-4 text-gray-300">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const HelpFAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const faqs: FAQItem[] = [
    {
      question: "How do I create a new list?",
      answer: "To create a new list, click the 'Create List' button on the homepage. You can then enter your list title, choose a category, and add items to your list. You can also use our AI-assisted list generation feature to get suggestions for list items.",
      category: "Lists"
    },
    {
      question: "What's the difference between whole list voting and item voting?",
      answer: "Topfived supports two types of voting: whole list voting and item-specific voting. Whole list voting allows users to upvote or downvote the entire list. Item-specific voting enables users to vote on individual items within a list. The list creator chooses which voting type to use when creating the list.",
      category: "Voting"
    },
    // ... (include all other FAQ items here)
  ];

  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];

  const filteredFAQs = faqs.filter(faq => 
    (activeCategory === 'All' || faq.category === activeCategory) &&
    (faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
     faq.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const quickStartSteps = [
    { text: "Sign up for a Topfived account", link: "/sign-up" },
    { text: "Explore existing lists to get inspired", link: "/explore" },
    { text: "Create your first list using the 'Create List' button", link: "/create-list" },
    { text: "Share your list on social media to engage with others", link: "/my-lists" },
    { text: "Vote on other lists and items to participate in the community", link: "/explore" },
  ];

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-6 bg-gray-900 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">Help & FAQ</h1>
      
      <motion.div 
        className="mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>
      </motion.div>

      <motion.div 
        className="mb-8 flex flex-wrap gap-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>
      
      <motion.section 
        className="mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <HelpCircle className="mr-2" size={24} />
          Frequently Asked Questions
        </h2>
        {filteredFAQs.map((faq, index) => (
          <FAQItem key={index} {...faq} />
        ))}
      </motion.section>
      
      <motion.section 
        className="mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <Book className="mr-2" size={24} />
          Quick Start Guide
        </h2>
        <ol className="space-y-4 bg-gray-800 p-6 rounded-lg">
          {quickStartSteps.map((step, index) => (
            <motion.li 
              key={index}
              className="flex items-center"
              whileHover={{ x: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-blue-400 mr-4">{index + 1}.</span>
              <Link 
                to={step.link} 
                className="text-blue-300 hover:text-blue-100 transition-colors duration-200 flex-grow"
              >
                {step.text}
              </Link>
              <ArrowRight className="text-blue-400 ml-2" size={18} />
            </motion.li>
          ))}
        </ol>
      </motion.section>
      
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <MessageCircle className="mr-2" size={24} />
          Still Need Help?
        </h2>
        <p className="mb-6 text-gray-300">If you couldn't find the answer you were looking for, please don't hesitate to reach out to our support team.</p>
        <Link to="/contactpage">
          <motion.button 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
          </motion.button>
        </Link>
      </motion.section>
    </motion.div>
  );
};

export default HelpFAQPage;