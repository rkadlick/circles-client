import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { createPostInCircle } from '../features/postThunks';
import styles from './CreatePost.module.css';

const CreatePostPage: React.FC = () => {
  const { circleName } = useParams<{ circleName: string }>(); // Circle name from URL
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState(''); // New state for link
  const [error, setError] = useState('');

  // URL validation function
  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!title || !content) {
      setError('Title and Body are required.');
      return;
    }
  
    if (link && !isValidUrl(link)) {
      setError('Please enter a valid link.');
      return;
    }
  
    try {
      // Clear the previous error if any
      setError('');
  
      console.log("Submitting post with:", {
        title,
        content,
        link,
        circleName,
        userId: user?.id
      });
  
      // Dispatch the createPostInCircle action
      await dispatch(createPostInCircle({
        title,
        content,
        link,
        circleName: circleName!,
        userId: user?.id!,
      })).unwrap();
  
      // Navigate to the circle page after creating the post
      navigate(`/c/${circleName}`);
  
    } catch (err: any) {
      // Log the error and display it in the component
      console.error("Error during post submission:", err.message);
      setError(err.message || "Something went wrong.");
    }
  };
  

  if (!user) {
    return <div className={styles.createContainer}>You must be logged in to create a post.</div>;
  }

  return (
    <div className={styles.createContainer}>
      <h2 className={styles.heading}>Create a Post in /c/{circleName}</h2>

      <form className={styles.createForm} onSubmit={handleSubmit}>
        <div className={styles.titleContainer}>
          <label className={styles.titleLabel} htmlFor="title">Title</label>
          <input
          className={styles.titleInput}
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your post..."
            required
          />
        </div>

        <div className={styles.linkContainer}>
          <label className={styles.linkLabel} htmlFor="link">Link (optional)</label>
          <input
          className={styles.linkInput}
            id="link"
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className={styles.descriptionContainer}>
          <label className={styles.descriptionLabel} htmlFor="content">Description</label>
          <textarea
          className={styles.descriptionInput}
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter a description for your post..."
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button className={styles.createButton} type="submit">Create Post</button>
      </form>
    </div>
  );
};

export default CreatePostPage;
