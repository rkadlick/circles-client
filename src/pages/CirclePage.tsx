import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../auth/supabaseClient'; // Assuming you have Supabase setup
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store'; // Ensure correct store import
import Post from '../components/Post';
import { checkCircleExists } from '../features/circleSlice';
import styles from './CirclePage.module.css'
import { fetchPostsByCircle } from '../features/postSlice';

const CirclePage: React.FC = () => {
  const { circleName } = useParams<{ circleName: string }>(); // Assuming the URL is /c/:circleName
  const navigate = useNavigate();
  const circleExists = useSelector((state: RootState) => state.circle.circleExists);
  const user = useSelector((state: RootState) => state.auth.user); // Check if the user is logged in
  const posts = useSelector((state: RootState) => state.post.posts); // Fetch posts under this circle
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkCircleExists(circleName)); // Check if circle exists
  }, [circleName, dispatch]);

  useEffect(() => {
    if (circleExists) {
      dispatch(fetchPostsByCircle(circleName)); // Fetch posts if circle exists
    }
  }, [circleExists, circleName, dispatch]);

  if (circleExists === null) {
    return <div>Loading...</div>; // Show a loading state while checking
  }

  if (!circleExists) {
    return (
      <div>
        <h2>This Circle does not exist.</h2>
        {user ? (
          <div>
            <p>It seems this circle hasn't been created yet. Want to create it?</p>
            <button onClick={() => navigate('/create-circle')}>
              Create Circle
            </button>
          </div>
        ) : (
          <p>You need to log in to create a circle.</p>
        )}
      </div>
    );
  }
console.log(posts)
  return (
    <div>
      <h1>Welcome to {circleName} Circle!</h1>
      <Link to={`/c/${circleName}/create-post`}>CLICK ME</Link>
	  <div className={styles.postsContainer}>
        {posts.map(post => (
          <Post
            key={post.id}
            id={post.id}
            title={post.title}
            author={post.author}
            created_at={post.created_at}
            thumbnail={post.thumbnail}
            num_comments={post.num_comments}
            permalink={post.permalink}
            initialVotes={post.initialVotes} // display votes as well
          />
          
        ))
        }
      </div>
    </div>
  );
};

export default CirclePage;
