import React from 'react';
import styles from './Post.module.css';

interface PostProps {
  title: string;
  author: string;
  created_utc: number;
  thumbnail: string;
  num_comments: number;
  permalink: string;
}

const Post: React.FC<PostProps> = ({ title, author, created_utc, thumbnail, num_comments, permalink }) => {
  const createdDate = new Date(created_utc * 1000).toLocaleDateString(); // Convert Unix timestamp to readable date

  return (
    <div className={styles.postContainer}>
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
