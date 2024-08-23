import React, { useState } from 'react';
import { Send, HelpCircle, Mail, MessageCircle, AlertTriangle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    // Simulate submission
    setSubmitted(true);
    // Reset form after submission
    setFormData({ name: '', email: '', category: '', message: '' });
  };

  const categories = [
    { value: 'general', label: 'General Inquiry', icon: <HelpCircle size={18} /> },
    { value: 'technical', label: 'Technical Support', icon: <AlertTriangle size={18} /> },
    { value: 'feedback', label: 'Feedback', icon: <MessageCircle size={18} /> },
    { value: 'business', label: 'Business Inquiry', icon: <FileText size={18} /> }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
      
      <div className="mb-8 text-center">
        <p className="text-lg mb-4">We're here to help! Send us a message and we'll get back to you as soon as possible.</p>
        <div className="flex justify-center space-x-4">
          <Link to="/helpfaqpage" className="text-blue-500 hover:text-blue-700 flex items-center">
            <HelpCircle size={20} className="mr-2" /> Check our FAQ
          </Link>
          <a href="mailto:support@topfived.com" className="text-blue-500 hover:text-blue-700 flex items-center">
            <Mail size={20} className="mr-2" /> Email Us Directly
          </a>
        </div>
      </div>

      {submitted ? (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p className="font-bold">Thank you for your message!</p>
          <p>We've received your inquiry and will respond as soon as possible.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            ></textarea>
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Send size={20} className="mr-2" /> Send Message
            </button>
          </div>
        </form>
      )}

      <div className="mt-12  p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="cursor-pointer">
            <summary className="font-medium">How do I create a list?</summary>
            <p className="mt-2 pl-4">To create a list, log in to your account, click on the "Create List" button in the top right corner, and follow the prompts to add your items and publish your list.</p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-medium">Can I edit my list after publishing?</summary>
            <p className="mt-2 pl-4">Yes, you can edit your list at any time. Simply go to your profile, find the list you want to edit, and click the "Edit" button.</p>
          </details>
          <details className="cursor-pointer">
            <summary className="font-medium">How do I report inappropriate content?</summary>
            <p className="mt-2 pl-4">If you come across any inappropriate content, please use the "Report" button located next to each list or comment. Our moderation team will review it promptly.</p>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
