import React, { useState } from 'react';
import styles from './SubMenu.module.css';

const subreddits: string[] = [
  "javascript", "reactjs", "typescript", "webdev", "frontend", "backend",
  "learnprogramming", "node", "css", "html", "programming", "vuejs",
  "angular", "nextjs", "graphql", "docker", "kubernetes", "devops", "aws",
  "cloud", "linux", "flutter", "swift", "java", "python", "ruby", "golang",
  "rust", "database", "security", "dataengineering"
];

const SubMenu: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className={styles.subredditList}>
      <div className={styles.dropdownContainer}>
        <button onClick={() => setShowDropdown(!showDropdown)} className={styles.dropdownButton}>
          My Subreddits <span className={styles.arrow}>▼</span>
        </button>
        {showDropdown && (
          <div className={styles.dropdownContent}>
            <ul className={styles.dropdownList}>
              {subreddits.map((subreddit, index) => (
                <li key={index} className={styles.dropdownItem}>
                  <a href={`https://www.reddit.com/r/${subreddit}/`} className={styles.link}>
                    {subreddit}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <ul className={styles.list}>
        {subreddits.map((subreddit, index) => (
          <li key={index} className={styles.listItem}>
            <a href={`https://www.reddit.com/r/${subreddit}/`} className={styles.link}>
              {subreddit}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubMenu;
