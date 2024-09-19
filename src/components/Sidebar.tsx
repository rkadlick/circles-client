// Sidebar.tsx
import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import SignUp from './auth/SignUp';
import SignIn from './auth/SignIn';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isSignUp, setIsSignUp] = useState(true);

  const toggleForm = () => setIsSignUp(prev => !prev);

  return (
    <aside className={styles.sidebar}>
      {!user ? (
        <div className="auth-container">
          {isSignUp ? (
            <SignUp onSwitch={toggleForm} />
          ) : (
            <SignIn onSwitch={toggleForm} />
          )}
        </div>
      ) : (
        <>
          <button className={styles.button}>Create a New Post</button>
          <Link to="/create-circle" className={styles.button}>
          Create a New Circle
        </Link>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
