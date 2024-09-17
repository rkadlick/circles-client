import React, { useState } from 'react';
import styles from './SignIn.module.css'; // Import the CSS Module
import { useDispatch } from 'react-redux';
import { signIn } from '../redux/authSlice';
import { AppDispatch } from '../redux/store';

const SignIn: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const dispatch: AppDispatch = useDispatch();
  
	const handleSignIn = async (e: React.FormEvent) => {
	  e.preventDefault();
	  dispatch(signIn({ email, password }));
	};

  return (
    <div className={styles.signinForm}>
      <h2>Sign In</h2>
      <form onSubmit={handleSignIn}>
        <div>
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Sign In</button>
      </form>
      <p className={styles.switchText}>
        Don't have an account? <button onClick={onSwitch} className={styles.switchButton}>Sign Up</button>
      </p>
    </div>
  );
};

export default SignIn;
