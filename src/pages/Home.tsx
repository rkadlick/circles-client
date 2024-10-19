import React, { useEffect } from 'react';
import Post from '../components/posts/Post';
import Sidebar from '../components/Sidebar';
import styles from './Home.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchAllPosts } from '../features/postThunks';
import { useState } from 'react';
import { sortPosts } from '../utils/sortPosts';

interface HomeProps {
  sortOrder: string;
}

const Home: React.FC<HomeProps> = ({ sortOrder }) => {
  const posts = useSelector((state: RootState) => state.posts.posts); // Fetch posts under this circle
  const dispatch = useDispatch();
  const [sortedPosts, setSortedPosts] = useState(posts); // Use state to hold sorted posts

  useEffect(() => {
    dispatch(fetchAllPosts()); // Fetch posts if circle exists
  }, [dispatch]);

  useEffect(() => {
    const newSortedPosts = sortPosts(posts, sortOrder); // Use the sorting function
    setSortedPosts(newSortedPosts);
  }, [posts, sortOrder]);
  return (
    <div className={styles.home}>
      <div className={styles.postsContainer}>
        {sortedPosts.map(post => (
          <Post
            key={post.id}
            id={post.id}
            title={post.title}
            author={post.author}
            created_at={post.created_at}
            thumbnail={post.thumbnail}
            number_of_comments={post.number_of_comments}
            link={post.link}
            number_of_votes={post.number_of_votes} // display votes as well
            circle={post.circles?.name}
            home_page={true}
          />
        ))}
      </div>
      <Sidebar />
    </div>
  );
};


export default Home;
