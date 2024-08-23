import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && <p className="mt-2 text-gray-400">{answer}</p>}
    </div>
  );
};

const HelpFAQPage = () => {
  const faqs = [
    {
      question: "How do I create a new list?",
      answer: "To create a new list, click the 'Create List' button on the homepage. You can then enter your list title, choose a category, and add items to your list. You can also use our AI-assisted list generation feature to get suggestions for list items."
    },
    {
      question: "What's the difference between whole list voting and item voting?",
      answer: "Topfived supports two types of voting: whole list voting and item-specific voting. Whole list voting allows users to upvote or downvote the entire list. Item-specific voting enables users to vote on individual items within a list. The list creator chooses which voting type to use when creating the list."
    },
    {
      question: "How does the AI-assisted list creation work?",
      answer: "Our AI-assisted list creation feature uses advanced algorithms to suggest relevant items for your list based on your title and preferences. As you type your list title, you'll see suggestions appear. You can choose to include these suggestions or add your own items."
    },
    {
      question: "Can I edit my list after publishing it?",
      answer: "Yes, you can edit your list after publishing. Go to your profile, find the list you want to edit, and click the 'Edit' button. Note that editing a list with existing votes may reset the vote count for changed items."
    },
    {
      question: "How do I share my list on social media?",
      answer: "Each list has a 'Share' button that allows you to easily share your list on various social media platforms. You can also copy a direct link to your list to share it anywhere."
    },
    {
      question: "What are 'Verified Creators' and how do I become one?",
      answer: "Verified Creators are users who have been recognized for consistently creating high-quality, engaging lists. To become a Verified Creator, you need to regularly create popular lists and engage with the community. We periodically review active users for verification."
    },
    {
      question: "How does the embed feature work?",
      answer: "The embed feature allows you to display your Topfived list on other websites. To use it, go to your list, click the 'Embed' button, and copy the provided code. You can then paste this code into your website or blog to showcase your list."
    },
    {
      question: "Can I create private lists?",
      answer: "Currently, all lists on Topfived are public. We're considering adding a private list feature in the future. Stay tuned for updates!"
    },
    {
      question: "How do list challenges work?",
      answer: "List challenges are time-limited events where users create lists on a specific theme. Participate by creating a list that fits the challenge theme. Winners are typically determined by a combination of community votes and curator selection."
    },
    {
      question: "I'm having trouble with the app. Where can I get support?",
      answer: "If you're experiencing issues, please visit our 'Contact Support' page. You can also check our Twitter @TopfivedSupport for any known issues or updates."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Help & FAQ</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Start Guide</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Sign up for a Topfived account</li>
          <li>Explore existing lists to get inspired</li>
          <li>Create your first list using the 'Create List' button</li>
          <li>Share your list on social media to engage with others</li>
          <li>Vote on other lists and items to participate in the community</li>
        </ol>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
        <p>If you couldn't find the answer you were looking for, please don't hesitate to reach out to our support team.</p>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          Contact Support
        </button>
      </section>
    </div>
  );
};

export default HelpFAQPage;