import React, { useEffect } from 'react';
import Post from '../components/Post';
import Sidebar from '../components/Sidebar';
import styles from './Home.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchAllPosts } from '../features/postSlice';

interface HomeProps {
  sortOrder: string;
}

const Home: React.FC<HomeProps> = ({ sortOrder }) => {
  const posts = useSelector((state: RootState) => state.post.posts); // Fetch posts under this circle
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllPosts()); // Fetch posts if circle exists
  }, []);

  let sortedPosts = [...posts];

    if (sortOrder === 'hot') {
      // Filter and sort by votes in the last 24 hours
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      sortedPosts = sortedPosts
        .filter(post => post.created_at > twentyFourHoursAgo) // posts within last 24 hours
        .sort((a, b) => b.votes - a.votes); // sort by votes, descending
    } else if (sortOrder === 'new') {
      // Sort by newest first
      sortedPosts = sortedPosts.sort((a, b) => b.created_at - a.created_at);
    } else if (sortOrder === 'top') {
      // Sort by most votes overall
      sortedPosts = sortedPosts.sort((a, b) => b.votes - a.votes);
    }

  return (
    <div className={styles.home}>
      <div className={styles.postsContainer}>
        {sortedPosts.map(post => (
          <Post
            key={post.id}
            title={post.title}
            author={post.author}
            created_at={post.created_at}
            thumbnail={post.thumbnail}
            num_comments={post.num_comments}
            permalink={post.permalink}
            initialVotes={post.votes} // display votes as well
          />
        ))}
      </div>
      <Sidebar />
    </div>
  );
};


export default Home;
