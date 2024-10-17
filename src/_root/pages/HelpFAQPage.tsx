import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, Book, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FAQItemProps {
  question: string;
  answer: string;
  category: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 py-4">
      <button
        className="flex justify-between items-center w-full text-left text-lg font-medium text-blue-400"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <p className="mt-4 text-gray-300">{answer}</p>}
    </div>
  );
};

const HelpFAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const faqs: FAQItemProps[] = [
    {
      question: "How do I create a new ranking?",
      answer: "Click 'Create List', enter a title and description, add items, choose voting settings, and publish.",
      category: "Lists and Rankings"
    },
    {
      question: "What's the difference between whole list and item voting?",
      answer: "Whole list voting: Users vote on the entire list. Item voting: Users vote on individual items in the list.",
      category: "Lists and Rankings"
    },
    {
      question: "Can I edit my ranking after publishing?",
      answer: "Yes. Go to your profile, find the list, click 'Edit', make changes, and save.",
      category: "Lists and Rankings"
    },
    {
      question: "How does the ranking system work?",
      answer: "Rankings are based on votes, recent activity, user engagement, and category popularity.",
      category: "Lists and Rankings"
    },
    {
      question: "What are 'Remix' lists?",
      answer: "Remix lets you create a new version of an existing list, adding your own perspective.",
      category: "Lists and Rankings"
    },
    {
      question: "How do I customize my profile?",
      answer: "Go to your profile, click 'Edit Profile', update your info, and save changes.",
      category: "Profile"
    },
    {
      question: "Can I make my profile private?",
      answer: "Yes. Go to settings, find 'Profile Privacy', and toggle it on.",
      category: "Profile"
    },
    {
      question: "How do friend requests work?",
      answer: "Visit a profile, click 'Add Friend'. They'll get a request to accept or decline.",
      category: "Social"
    },
    {
      question: "How do I save a list for later?",
      answer: "Click the bookmark icon on any list. Access saved lists from your profile.",
      category: "Using Topfived"
    },
    {
      question: "How can I share lists?",
      answer: "Click the share button on a list, then choose how you want to share it.",
      category: "Using Topfived"
    },
    {
      question: "Is there a mobile app?",
      answer: "Not yet, but our website works great on mobile browsers.",
      category: "Technical"
    },
    {
      question: "How is my data used?",
      answer: "We use your data to personalize your experience and improve our service. We don't sell your info.",
      category: "Privacy"
    },
    {
      question: "How do I change my password?",
      answer: "Go to Settings > Account > Change Password. Enter your current and new password.",
      category: "Account"
    },
    {
      question: "How do I manage notifications?",
      answer: "Go to Settings > Notifications. Toggle on/off the types of notifications you want.",
      category: "Account"
    }
  ];

  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];

  const filteredFAQs = faqs.filter(faq => 
    (activeCategory === 'All' || faq.category === activeCategory) &&
    (faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
     faq.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-400">Help & FAQ</h1>
      
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1 rounded-full text-sm ${
              activeCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category}
          </Button>
        ))}
      </div>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <HelpCircle className="mr-2" size={20} />
          Frequently Asked Questions
        </h2>
        {filteredFAQs.map((faq, index) => (
          <FAQItem key={index} {...faq} />
        ))}
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <MessageCircle className="mr-2" size={20} />
          Need More Help?
        </h2>
        <p className="mb-4 text-gray-300">Can't find what you're looking for? We're here to help!</p>
        <Link to="/contactpage">
          <Button className="bg-blue-500 hover:bg-blue-600">
            Contact Support
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default HelpFAQPage;