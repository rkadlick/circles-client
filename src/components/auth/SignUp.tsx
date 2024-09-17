import React, { useState } from 'react';
import styles from './SignUp.module.css'; // Import the CSS Module
import { useDispatch } from 'react-redux';
import { signUp } from '../../redux/authSlice';
import { AppDispatch } from '../../redux/store';

const SignUp: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
	const dispatch: AppDispatch = useDispatch();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
  
	const handleSignUp = async (e: React.FormEvent) => {
	  e.preventDefault();
	  try {
		// Dispatch the action with a single object containing email, password, and username
		await dispatch(signUp({ email, password, username }));
		// Handle successful sign up
	  } catch (error) {
		// Handle errors
		console.error('Sign up error:', error);
	  }
	};

  return (
    <div className={styles.signupForm}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
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
        <div>
          <label>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <p className={styles.switchText}>
        Already have an account? <button onClick={onSwitch} className={styles.switchButton}>Log In</button>
      </p>
    </div>
  );
};

export default SignUp;
