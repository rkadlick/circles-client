import React, { useState } from 'react';
import styles from './SubMenu.module.css';

const circles: string[] = [
  "javascript", "reactjs", "typescript", "webdev", "frontend", "backend",
  "learnprogramming", "node", "css", "html", "programming", "vuejs",
  "angular", "nextjs", "graphql", "docker", "kubernetes", "devops", "aws",
  "cloud", "linux", "flutter", "swift", "java", "python", "ruby", "golang",
  "rust", "database", "security", "dataengineering"
];

const SubMenu: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className={styles.circleList}>
      <div className={styles.dropdownContainer}>
        <button onClick={() => setShowDropdown(!showDropdown)} className={styles.dropdownButton}>
          Circles <span className={styles.arrow}>▼</span>
        </button>
        {showDropdown && (
          <div className={styles.dropdownContent}>
            <ul className={styles.dropdownList}>
              {circles.map((circle, index) => (
                <li key={index} className={styles.dropdownItem}>
                  <a href={`https://www.circle.com/r/${circle}/`} className={styles.link}>
                    {circle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <ul className={styles.list}>
        {circles.map((circle, index) => (
          <li key={index} className={styles.listItem}>
            <a href={`https://www.circle.com/r/${circle}/`} className={styles.link}>
              {circle}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubMenu;
