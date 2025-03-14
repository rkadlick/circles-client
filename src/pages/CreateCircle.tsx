import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { createCircle } from '../features/circleThunks'; // Adjust the import based on your setup
import styles from './CreateCircle.module.css'; // Add styling as needed
import { RootState } from '../redux/store';

const CreateCircle: React.FC = () => {
  const [name, setName] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);
  const [description, setDescription] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      const created_by = user.id;
      
      // Dispatch the createCircle action and wait for the result
      const resultAction = await dispatch(createCircle({ name, description, created_by }));
      
      // Check if the action was successful and the circle was created
      if (createCircle.fulfilled.match(resultAction)) {
        // Redirect to the newly created circle page using the circle name
        navigate(`/c/${name}`);
      } else {
        // Optionally handle errors (e.g., display a message to the user)
        console.error("Failed to create circle");
      }
    }
  };

  return (
    <div className={styles.createContainer}>
      <h1 className={styles.heading}>Create a New Circle</h1>
      <form className={styles.createForm} onSubmit={handleSubmit}>
        <div className={styles.titleContainer}>
          <label className={styles.titleLabel} htmlFor="name">Circle Name</label>
          <input
          className={styles.titleInput}
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.descriptionContainer}>
          <label className={styles.descriptionInput} htmlFor="description">Description</label>
          <textarea
          className={styles.descriptionInput}
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button className={styles.createButton} type="submit">Create Circle</button>
      </form>
    </div>
  );
};

export default CreateCircle;
