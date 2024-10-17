import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, HelpCircle, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";
import { databases, appwriteConfig } from '@/lib/appwrite/config';
import { ID } from 'appwrite';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: ''
  });
  const [showFAQ, setShowFAQ] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.name.trim().length < 2) {
      toast({
        title: "Invalid Name",
        description: "Name must be at least 2 characters long.",
        variant: "destructive",
      });
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }
    if (formData.message.trim().length < 10) {
      toast({
        title: "Invalid Message",
        description: "Message must be at least 10 characters long.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.contactMessagesCollectionId,
        ID.unique(),
        {
          ...formData,
          createdAt: new Date().toISOString(),
        }
      );

      if (response.$id) {
        setSubmitted(true);
        setFormData({ name: '', email: '', category: '', message: '' });
        toast({
          title: "Message Sent!",
          description: "We've received your message and will get back to you soon.",
          duration: 5000,
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'business', label: 'Business Inquiry' }
  ];

  const faqs = [
    { question: "How do I create a list?", answer: "To create a list, log in to your account, click on the 'Create List' button in the top right corner, and follow the prompts to add your items and publish your list." },
    { question: "Can I edit my list after publishing?", answer: "Yes, you can edit your list at any time. Simply go to your profile, find the list you want to edit, and click the 'Edit' button." },
    { question: "How do I report inappropriate content?", answer: "If you come across any inappropriate content, please use the 'Report' button located next to each list or comment. Our moderation team will review it promptly." }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-gray-900 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-lg opacity-90">We're here to help and listen to your feedback!</p>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap justify-between gap-4 mb-8">
            <div className="flex items-center">
              <Mail className="mr-2" size={20} />
              <div>
                <h3 className="font-semibold">Email Us</h3>
                <p className="text-sm opacity-80">support@topfived.com</p>
              </div>
            </div>
            <Button
              onClick={() => setShowFAQ(!showFAQ)}
              variant="outline"
              className="flex items-center bg-gray-900"
            >
              <HelpCircle className="mr-2" size={20} />
              FAQ
              {showFAQ ? <ChevronUp className="ml-2" size={16} /> : <ChevronDown className="ml-2" size={16} />}
            </Button>
          </div>

          <AnimatePresence>
            {showFAQ && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 bg-gray-800 p-4 rounded-lg"
              >
                <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                {faqs.map((faq, index) => (
                  <details key={index} className="mb-2">
                    <summary className="cursor-pointer font-medium">{faq.question}</summary>
                    <p className="mt-2 pl-4 text-sm opacity-90">{faq.answer}</p>
                  </details>
                ))}
                <div className="mt-6 text-center">
                  <Link 
                    to="/helpfaqpage" 
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    Visit our Help Center for more information
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-700"
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-700"
                />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full p-2 rounded-md bg-gray-800 border border-gray-700"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <div className="relative">
                  <Textarea
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full p-2 rounded-md bg-gray-800 border border-gray-700"
                  />
                  <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {formData.message.length}/500
                  </span>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={18} className="mr-2" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-center text-gray-400 text-sm"
      >
        <p>By contacting us, you agree to our <Link to="/privacypolicy" className="text-blue-400 hover:underline">Privacy Policy</Link> and <Link to="/termsandconditions" className="text-blue-400 hover:underline">Terms of Service</Link>.</p>
      </motion.div>
    </div>
  );
};

export default ContactPage;