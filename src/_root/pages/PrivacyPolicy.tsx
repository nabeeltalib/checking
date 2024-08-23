import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: 'white', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'gray', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Topfived Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>1. Introduction</h2>
      <p>Welcome to Topfived ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application (collectively, the "Platform").</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>2. Information We Collect</h2>
      <p>We collect information that you provide directly to us, including:</p>
      <ul>
        <li>Personal information (e.g., name, email address, profile data)</li>
        <li>Content you create (e.g., lists, comments, votes)</li>
        <li>Communications you have with us</li>
      </ul>
      <p>We also automatically collect certain information when you use the Platform, including:</p>
      <ul>
        <li>Usage data (e.g., pages visited, features used)</li>
        <li>Device information (e.g., IP address, browser type, operating system)</li>
      </ul>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>3. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide and maintain the Platform</li>
        <li>Personalize your experience</li>
        <li>Communicate with you about the Platform</li>
        <li>Analyze usage of the Platform</li>
        <li>Enforce our terms, conditions, and policies</li>
        <li>Respond to legal requests and prevent harm</li>
      </ul>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>4. Sharing of Your Information</h2>
      <p>We may share your information with:</p>
      <ul>
        <li>Service providers who help us operate the Platform</li>
        <li>Other users, as part of the normal operation of the Platform (e.g., public lists)</li>
        <li>Legal authorities when required by law or to protect our rights</li>
      </ul>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>5. Your Rights and Choices</h2>
      <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
      <ul>
        <li>Access to your personal information</li>
        <li>Correction of inaccurate data</li>
        <li>Deletion of your data</li>
        <li>Objection to certain processing activities</li>
        <li>Data portability</li>
      </ul>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>6. Data Security</h2>
      <p>We implement appropriate technical and organizational measures to protect your personal information.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>7. International Data Transfers</h2>
      <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>8. Children's Privacy</h2>
      <p>The Platform is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>9. Changes to This Privacy Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>10. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at [contact email].</p>
    </div>
  );
};

export default PrivacyPolicy;
