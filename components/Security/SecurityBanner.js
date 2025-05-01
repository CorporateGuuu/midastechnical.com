import styles from './Security.module.css';

const SecurityBanner = () => {
  return (
    <div className={styles.securityBanner}>
      This site is protected by Cloudflare and uses encryption to safeguard your data.
      <a href="/privacy" target="_blank" rel="noopener noreferrer">Learn more</a>
    </div>
  );
};

export default SecurityBanner;
