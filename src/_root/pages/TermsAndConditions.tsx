import React from 'react';

const TermsAndConditions: React.FC = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: 'white', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'gray', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Topfived Terms and Conditions</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>1. Agreement to Terms</h2>
      <p>By using our Platform, you agree to be bound by these Terms and Conditions.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>2. Intellectual Property Rights</h2>
      <p>The Platform and its original content, features, and functionality are owned by Topfived and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>3. User Accounts</h2>
      <p>You are responsible for safeguarding the password that you use to access the Platform and for any activities or actions under your password.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>4. User-Generated Content</h2>
      <p>You may post, upload, publish, submit or transmit user-generated content. By making available any user-generated content on or through the Platform, you grant us a worldwide, irrevocable, perpetual, non-exclusive, transferable, royalty-free license to use, sell, reproduce, distribute, modify, adapt, publicly display, and perform the user-generated content.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>5. Prohibited Uses</h2>
      <p>You may not use the Platform in any way that violates any applicable national or international law or regulation.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>6. Termination</h2>
      <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>7. Limitation of Liability</h2>
      <p>In no event shall Topfived, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Platform.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>8. Governing Law</h2>
      <p>These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>9. Changes to Terms</h2>
      <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>10. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us at [contact email].</p>
    </div>
  );
};

export default TermsAndConditions;
