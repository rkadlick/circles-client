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
  const user = useSelector((state: RootState) => state.auth.user); // Check if the user is logged in
  const posts = useSelector((state: RootState) => state.posts.posts); // Fetch posts under this circle
  const dispatch = useDispatch();
  const [sortedPosts, setSortedPosts] = useState(posts); // Use state to hold sorted posts
  const [hasFetchedPosts, setHasFetchedPosts] = useState(false);

  useEffect(() => {
    if(user){
      dispatch(fetchAllPosts(user));
      setHasFetchedPosts(true);
    }else{
      dispatch(fetchAllPosts());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (posts.length > 0) {
      const newSortedPosts = sortPosts(posts, sortOrder);
      setSortedPosts(newSortedPosts);
    }
  }, [posts, sortOrder]);

/*  sortedPosts.map(post => (
    console.log(post)
  ))*/

  return (
    <div className={styles.home}>
      <div className={styles.postsContainer}>
        {sortedPosts.map(post => (
          <Post
            key={post.id}
            id={post.id}
            title={post.title}
            author={post.users.username}
            created_at={post.created_at}
            thumbnail={post.thumbnail}
            number_of_comments={post.number_of_comments}
            link={post.link}
            number_of_votes={post.number_of_votes} // display votes as well
            circle={post.circles?.name}
            voteType={post.user_vote}
            home_page={true}
          />
        ))}
      </div>
    </div>
  );
};


export default Home;
