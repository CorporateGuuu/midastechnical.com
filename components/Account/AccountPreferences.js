import { useState } from 'react';
import styles from '../../styles/Account.module.css';

const AccountPreferences = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: {
      orderUpdates: true,
      promotions: true,
      newProducts: false,
      blog: false
    },
    displayPreferences: {
      theme: 'light',
      currency: 'USD',
      language: 'en'
    },
    privacySettings: {
      shareDataForAnalytics: true,
      allowPersonalization: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleEmailNotificationChange = (e) => {
    const { name, checked } = e.target;
    setPreferences({
      ...preferences,
      emailNotifications: {
        ...preferences.emailNotifications,
        [name]: checked
      }
    });
  };

  const handleDisplayPreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences({
      ...preferences,
      displayPreferences: {
        ...preferences.displayPreferences,
        [name]: value
      }
    });
  };

  const handlePrivacySettingChange = (e) => {
    const { name, checked } = e.target;
    setPreferences({
      ...preferences,
      privacySettings: {
        ...preferences.privacySettings,
        [name]: checked
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would call an API to save preferences
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Account Preferences</h2>
      <p>Customize your account settings and preferences</p>
      
      <form className={styles.preferencesForm} onSubmit={handleSubmit}>
        {/* Email Notifications */}
        <div>
          <h3>Email Notifications</h3>
          
          <div className={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="orderUpdates" 
              name="orderUpdates" 
              checked={preferences.emailNotifications.orderUpdates} 
              onChange={handleEmailNotificationChange}
            />
            <label htmlFor="orderUpdates">Order updates and shipping notifications</label>
          </div>
          
          <div className={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="promotions" 
              name="promotions" 
              checked={preferences.emailNotifications.promotions} 
              onChange={handleEmailNotificationChange}
            />
            <label htmlFor="promotions">Promotions and discounts</label>
          </div>
          
          <div className={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="newProducts" 
              name="newProducts" 
              checked={preferences.emailNotifications.newProducts} 
              onChange={handleEmailNotificationChange}
            />
            <label htmlFor="newProducts">New product announcements</label>
          </div>
          
          <div className={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="blog" 
              name="blog" 
              checked={preferences.emailNotifications.blog} 
              onChange={handleEmailNotificationChange}
            />
            <label htmlFor="blog">Blog posts and repair guides</label>
          </div>
        </div>
        
        {/* Display Preferences */}
        <div>
          <h3>Display Preferences</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="theme">Theme</label>
            <select 
              id="theme" 
              name="theme" 
              value={preferences.displayPreferences.theme} 
              onChange={handleDisplayPreferenceChange}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="currency">Currency</label>
            <select 
              id="currency" 
              name="currency" 
              value={preferences.displayPreferences.currency} 
              onChange={handleDisplayPreferenceChange}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="language">Language</label>
            <select 
              id="language" 
              name="language" 
              value={preferences.displayPreferences.language} 
              onChange={handleDisplayPreferenceChange}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
        
        {/* Privacy Settings */}
        <div>
          <h3>Privacy Settings</h3>
          
          <div className={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="shareDataForAnalytics" 
              name="shareDataForAnalytics" 
              checked={preferences.privacySettings.shareDataForAnalytics} 
              onChange={handlePrivacySettingChange}
            />
            <label htmlFor="shareDataForAnalytics">
              Share anonymous usage data to help us improve our services
            </label>
          </div>
          
          <div className={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="allowPersonalization" 
              name="allowPersonalization" 
              checked={preferences.privacySettings.allowPersonalization} 
              onChange={handlePrivacySettingChange}
            />
            <label htmlFor="allowPersonalization">
              Allow personalized product recommendations based on your browsing history
            </label>
          </div>
        </div>
        
        {/* Form Actions */}
        <button 
          type="submit" 
          className={styles.saveButton}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
        
        {success && (
          <div className={styles.successMessage}>
            Your preferences have been saved successfully.
          </div>
        )}
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default AccountPreferences;
