import React, { useEffect, useState } from 'react';
import styles from './SubMenu.module.css';
import { RootState } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserCircles } from '../../features/circleSlice';

const SubMenu: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const circles = useSelector((state: RootState) => state.circle.circles);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (user && circles.length === 0) {  // Only fetch circles if they haven't been fetched yet
      dispatch(fetchUserCircles(user.id));
    }
  }, [user, dispatch]);  // Removed 'circles' from the dependency array

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
