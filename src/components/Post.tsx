import React, { useState, useEffect } from 'react';
import styles from './Post.module.css';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { supabase } from '../auth/supabaseClient'; // Adjust the import path
import { formatTimeAgo } from '../utils/formatTimeAgo';

interface PostProps {
  id: string;
  title: string;
  author: string;
  created_at: number;
  thumbnail: string;
  num_comments: number;
  permalink: string;
  initialVotes: number;
}

const Post: React.FC<PostProps> = ({ id, title, author, created_at, thumbnail, num_comments, permalink, initialVotes }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [votes, setVotes] = useState<number>(initialVotes);
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(false);
  const [recentUpvotes, setRecentUpvotes] = useState<number>(0);
  const createdDate = formatTimeAgo(created_at.toString()); // Convert created date

  /* useEffect(() => {
    const checkUserUpvote = async () => {
      if (user) {
        const { data } = await supabase
          .from('upvotes')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', id);

        setHasUpvoted(data.length > 0);
      }
    }; 

    const fetchRecentUpvotes = async () => {
      const { data, error } = await supabase
        .from('upvotes')
        .select('id')
        .eq('post_id', id)
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching recent upvotes:', error.message);
      } else {
        setRecentUpvotes(data.length);
      }
    };

    checkUserUpvote();
    fetchRecentUpvotes();
  }, [user, id]); 

  // Function to handle upvote
  const handleUpvote = async () => {
    if (user) {
      if (!hasUpvoted) {
        const { error } = await supabase
          .from('upvotes')
          .insert([{ user_id: user.id, post_id: id }]);

        if (!error) {
          setVotes(votes + 1);
          setHasUpvoted(true);
        } else {
          console.error('Error inserting upvote:', error.message);
        }
      } else {
        alert('You have already upvoted this post.');
      }
    } else {
      alert('You must be signed in to upvote.');
    }
  }; */

  const handleUpvote = () => {
    if (user) {
      if (!hasUpvoted) {
        setVotes(votes + 1);
        setHasUpvoted(true);
      } else {
        alert('You have already upvoted this post.');
      }
    } else {
      alert('You must be signed in to upvote.');
    }
  };

  return (
    <div className={styles.postContainer}>
      {/* Left-side votes and upvote arrow */}
      <div className={styles.voteContainer}>
        <div 
          className={`${styles.upvoteArrow} ${!user ? styles.disabled : ''}`} 
          onClick={handleUpvote}
        >
          ⬆️
        </div>
        <div className={styles.voteCount}>{votes}</div>
        <div className={styles.recentUpvotes}>Recent Upvotes: {recentUpvotes}</div>
      </div>

      {/* Post content */}
      {thumbnail ? (
        <img src={thumbnail} alt="Thumbnail" className={styles.thumbnail} />
      ) : (
        <div className={styles.thumbnail}>No Image</div>
      )}
      <div className={styles.postContent}>
        <a href={`https://www.reddit.com${permalink}`} className={styles.title}>
          {title}
        </a>
        <div className={styles.meta}>
          Submitted by <a href="#">{author}</a> on {createdDate}
        </div>
        <div className={styles.comments}>{num_comments} comments</div>
      </div>
    </div>
  );
};

export default Post;
