import Head from 'next/head';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send the form data to your server
    // For this demo, we'll just simulate a successful submission
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };
  
  return (
    <>
      <Head>
        <title>Contact Us - Midas Technical Solutions</title>
        <meta name="description" content="Contact Midas Technical Solutions for inquiries about our products, technical support, or business opportunities." />
      </Head>
      
      <Header />
      
      <main>
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Contact Us</h1>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Get in Touch</h2>
              <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Have questions about our products or services? Need technical support? 
                We're here to help! Fill out the form and we'll get back to you as soon as possible.
              </p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Contact Information</h3>
                <p style={{ marginBottom: '0.5rem' }}><strong>Address:</strong> Vienna, VA 22182</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Phone:</strong> +1 (240) 351-0511</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> support@mdtstech.store</p>
                <p><strong>Hours:</strong> Mon-Fri 9AM-10PM EST</p>
              </div>
            </div>
            
            <div style={{ flex: '1 1 300px' }}>
              {formStatus.submitted && formStatus.success ? (
                <div style={{ 
                  backgroundColor: '#d1e7dd', 
                  color: '#0f5132', 
                  padding: '1rem', 
                  borderRadius: '0.25rem',
                  marginBottom: '1rem'
                }}>
                  {formStatus.message}
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="subject" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem'
                      }}
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#0066cc',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
