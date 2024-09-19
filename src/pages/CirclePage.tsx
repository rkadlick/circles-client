import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../auth/supabaseClient'; // Assuming you have Supabase setup
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store'; // Ensure correct store import
import Post from '../components/Post';
import { fetchPostsByCircle } from '../features/circleSlice';

const CirclePage: React.FC = () => {
  const { circleName } = useParams<{ circleName: string }>(); // Assuming the URL is /c/:circleName
  const navigate = useNavigate();
  const [circleExists, setCircleExists] = useState<boolean | null>(null); // null means still loading
  const user = useSelector((state: RootState) => state.auth.user); // Check if the user is logged in
  const posts = useSelector((state: RootState) => state.circle.posts); // Fetch posts under this circle
  const dispatch = useDispatch();

  useEffect(() => {
    const checkCircleExists = async () => {
		console.log(circleName)
      const { data, error } = await supabase
        .from('circles')
        .select('id, name')
        .eq('name', circleName)
        .single();

	console.log(data)

      if (error || !data) {
        setCircleExists(false); // Circle doesn't exist
      } else {
        setCircleExists(true); // Circle exists
      }
    };

    checkCircleExists();
  }, [circleName]);

  useEffect(() => {
    if (circleName) {
      dispatch(fetchPostsByCircle(circleName)); // Action to fetch posts for the circle
    }
  }, [circleName, dispatch]);

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

  return (
    <div>
      <h1>Welcome to {circleName} Circle!</h1>
	  <div className={styles.postsContainer}>
        {posts.map(post => (
          <Post
            key={post.id}
            title={post.title}
            author={post.author}
            created_utc={post.created_utc}
            thumbnail={post.thumbnail}
            num_comments={post.num_comments}
            permalink={post.permalink}
            initialVotes={post.votes} // display votes as well
          />
        ))}
      </div>
    </div>
  );
};

export default CirclePage;
