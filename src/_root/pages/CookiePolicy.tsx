import React from 'react';

const CookiePolicy: React.FC = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: 'white', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'gray', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Topfived Cookie Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>1. Introduction</h2>
      <p>This Cookie Policy explains how Topfived ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our Platform. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>2. What are cookies?</h2>
      <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>3. Why do we use cookies?</h2>
      <p>We use cookies for several reasons:</p>
      <ul>
        <li>To enable certain functions of the Platform</li>
        <li>To provide analytics</li>
        <li>To store your preferences</li>
        <li>To enable ad delivery and behavioral advertising</li>
      </ul>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>4. Types of cookies we use</h2>
      <ul>
        <li>Essential cookies: Necessary for the operation of the Platform</li>
        <li>Analytical/performance cookies: Allow us to recognize and count the number of visitors and see how visitors move around the Platform</li>
        <li>Functionality cookies: Used to recognize you when you return to the Platform</li>
        <li>Targeting cookies: Record your visit to the Platform, the pages you have visited and the links you have followed</li>
      </ul>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>5. How can you control cookies?</h2>
      <p>You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>6. Changes to this Cookie Policy</h2>
      <p>We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal or regulatory reasons. Please re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.</p>

      <h2 style={{ color: 'gray', marginTop: '30px' }}>7. Contact Us</h2>
      <p>If you have any questions about our use of cookies or other technologies, please contact us at [contact email].</p>
    </div>
  );
};

export default CookiePolicy;
