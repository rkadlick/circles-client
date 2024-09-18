import React, { useEffect, useState } from 'react';
import Post from '../components/Post';
import Sidebar from '../components/Sidebar';
import styles from './Home.module.css'

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
      votes: 150,
      permalink: '/r/javascript/comments/1'
    },
    {
      id: '2',
      title: 'React vs Vue: Which One is Better?',
      author: 'frontendninja',
      created_utc: 1683043200,
      thumbnail: 'https://via.placeholder.com/140',
      num_comments: 42,
      votes: 120,
      permalink: '/r/javascript/comments/2'
    },
    {
      id: '3',
      title: 'Introduction to TypeScript for Beginners',
      author: 'codewizard',
      created_utc: 1682956800,
      thumbnail: '',
      num_comments: 18,
      votes: 300,
      permalink: '/r/javascript/comments/3'
    },
    {
      id: '4',
      title: 'Mastering CSS Grid',
      author: 'designqueen',
      created_utc: 1682966800,
      thumbnail: 'https://via.placeholder.com/140',
      num_comments: 50,
      votes: 170,
      permalink: '/r/javascript/comments/4'
    }
  ];

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = () => {
      let sortedPosts = [...fakePosts];

      if (sortOrder === 'hot') {
        // Filter and sort by votes in the last 24 hours
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
        sortedPosts = sortedPosts
          .filter(post => post.created_utc > twentyFourHoursAgo) // posts within last 24 hours
          .sort((a, b) => b.votes - a.votes); // sort by votes, descending
      } else if (sortOrder === 'new') {
        // Sort by newest first
        sortedPosts = sortedPosts.sort((a, b) => b.created_utc - a.created_utc);
      } else if (sortOrder === 'top') {
        // Sort by most votes overall
        sortedPosts = sortedPosts.sort((a, b) => b.votes - a.votes);
      }

      setPosts(sortedPosts);
    };

    fetchPosts();
  }, [sortOrder]);

  return (
    <div className={styles.home}>
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
      <Sidebar />
    </div>
  );
};


export default Home;
