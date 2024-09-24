import React, { useState, useEffect } from "react";
import styles from "./Post.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { supabase } from "../../auth/supabaseClient"; // Adjust the import path
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import { Link, useLocation } from "react-router-dom";

interface PostProps {
  id: string;
  title: string;
  author: string;
  created_at: number;
  thumbnail: string;
  num_of_comments: number;
  link: string;
  number_of_upvotes: number;
  circle: string;
  home_page?: boolean;
}

const Post: React.FC<PostProps> = ({
  id,
  title,
  author,
  created_at,
  thumbnail,
  num_of_comments,
  link,
  number_of_upvotes,
  circle,
  home_page,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [votes, setVotes] = useState<number>(number_of_upvotes);
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(false);
  const [recentUpvotes, setRecentUpvotes] = useState<number>(0);
  const createdDate = formatTimeAgo(created_at.toString()); // Convert created date
  const location = useLocation();

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
        alert("You have already upvoted this post.");
      }
    } else {
      alert("You must be signed in to upvote.");
    }
  };

  return (
    <div className={styles.postContainer}>
      {/* Left-side votes and upvote arrow */}
      <div className={styles.voteContainer}>
        <div
          className={`${styles.upvoteArrow} ${!user ? styles.disabled : ""}`}
          onClick={handleUpvote}
        >
          ⬆️
        </div>
        <div className={styles.voteCount}>{votes}</div>
        <div
          className={`${styles.upvoteArrow} ${!user ? styles.disabled : ""}`}
          onClick={handleUpvote}
        >
          ⬆️
        </div>
      </div>

      {/* Post content */}
      {thumbnail ? (
        <img src={thumbnail} alt="Thumbnail" className={styles.thumbnail} />
      ) : (
        <div className={styles.thumbnail}>No Image</div>
      )}
      <div className={styles.postContent}>
        {link ? (
          <Link to={link} className={styles.title}>
            {title}
          </Link>
        ) : (
          <Link to={`/c/${circle}/post/${id}`} className={styles.title}>
            {title}
          </Link>
        )}
        <div className={styles.meta}>
          Submitted by <a href="#">{author}</a> {createdDate}{" "}
          {home_page && "in "}
          {home_page && (
            <Link to={`/c/${circle}/`} className={styles.circleLink}>
              c/{circle}
            </Link>
          )}
        </div>

        <Link to={`/c/${circle}/post/${id}`} className={styles.comments}>
          {num_of_comments} comment{num_of_comments !== 1 && "s"}
        </Link>
      </div>
    </div>
  );
};

export default Post;
