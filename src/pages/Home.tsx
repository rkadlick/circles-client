import React, { useEffect, useState } from 'react';
import Post from '../components/Post';
import Sidebar from '../components/Sidebar';
import styles from './Home.module.css'
import { supabase } from '../auth/supabaseClient';

interface HomeProps {
  sortOrder: string;
}

const Home: React.FC<HomeProps> = ({ sortOrder }) => {
  const fakePosts = [
    {
      id: '1',
      title: 'Understanding JavaScript Closures',
      author: 'devguru',
      created_utc: 1683129600,
      thumbnail: 'https://via.placeholder.com/140',
      num_comments: 25,
      permalink: '/r/javascript/comments/1'
    },
    {
      id: '2',
      title: 'React vs Vue: Which One is Better?',
      author: 'frontendninja',
      created_utc: 1683043200,
      thumbnail: 'https://via.placeholder.com/140',
      num_comments: 42,
      permalink: '/r/javascript/comments/2'
    },
    {
      id: '3',
      title: 'Introduction to TypeScript for Beginners',
      author: 'codewizard',
      created_utc: 1682956800,
      thumbnail: '',
      num_comments: 18,
      permalink: '/r/javascript/comments/3'
    }
  ];

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase
        .from('posts')
        .select('*');
        
      // Apply sorting based on sortOrder
      if (sortOrder === 'hot') {
        query = query.order('votes', { ascending: false });
      } else if (sortOrder === 'new') {
        query = query.order('created_at', { ascending: false });
      } else if (sortOrder === 'top') {
        query = query.order('votes', { ascending: false });
      }

      const { data: posts, error } = await query;
      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(posts);
      }
    };

    fetchPosts();
  }, [sortOrder]);

  return (
    <div className={styles.home}>
      <div className={styles.postsContainer}>
      {fakePosts.map(post => (
        <Post
          key={post.id}
          title={post.title}
          author={post.author}
          created_utc={post.created_utc}
          thumbnail={post.thumbnail}
          num_comments={post.num_comments}
          permalink={post.permalink}
        />
      ))}
      </div>
      <Sidebar />
    </div>
  );
};

export default Home;
