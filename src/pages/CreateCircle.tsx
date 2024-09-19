import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCircle } from '../features/circleSlice'; // Adjust the import based on your setup
import styles from './CreateCircle.module.css'; // Add styling as needed
import { RootState } from '../redux/store';

const CreateCircle: React.FC = () => {
  const [name, setName] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);
  const [description, setDescription] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
	if(user){
		const created_by = user.id
		dispatch(createCircle({ name, description, created_by }));
	}
    
    // Optionally, redirect or show success message
  };

  return (
    <div className={styles.createCircleContainer}>
      <h1>Create a New Circle</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Circle Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Circle</button>
      </form>
    </div>
  );
};

export default CreateCircle;
