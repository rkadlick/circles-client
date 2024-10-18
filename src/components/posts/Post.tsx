import React, { useState, useEffect } from "react";
import styles from "./Post.module.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { supabase } from "../../auth/supabaseClient"; // Adjust the import path
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import { Link, useLocation } from "react-router-dom";
import DownArrow from "../../assets/downArrowOutline.svg?react";
import downArrowOutline from "../../assets/downArrowOutline.svg";
import UpArrow from "../../assets/upArrowOutline.svg?react";
import upArrowOutline from "../../assets/upArrowOutline.svg";
import { handleVote } from "../../features/postSlice";

interface PostProps {
  id: string;
  title: string;
  author: string;
  created_at: number;
  thumbnail: string;
  num_of_comments: number;
  link: string;
  number_of_votes: number;
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
  number_of_votes,
  circle,
  home_page,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userVote = useSelector((state: RootState) => 
    state.posts.posts.find(post => post.id === id)?.userVote || "neutral"
  ); // Fetch the user's current vote from the Redux state
  const [votes, setVotes] = useState<number>(number_of_votes);
  const createdDate = formatTimeAgo(created_at.toString());
  const dispatch = useDispatch();

    useEffect(() => {
    setVotes(number_of_votes); // Update votes when Redux state changes
  }, [number_of_votes]);

  const onVote = (voteType) => {
    if (user) {
      // Dispatch vote action with current vote type, user, and post id
      dispatch(
        handleVote({
          voteType: voteType,
          userId: user.id,
          postId: id,
          previousVoteType: userVote,
        })
      );
    } else {
      alert("You must be signed in to vote.");
    }
  };

  const handleUpvoteClick = () => {
    onVote(userVote === "up" ? "neutral" : "up");
  };

  const handleDownvoteClick = () => {
    onVote(userVote === "down" ? "neutral" : "down");
  };


  return (
    <div className={styles.postContainer}>
      {/* Left-side votes and upvote arrow */}
      <div className={styles.voteContainer}>
        <div
          className={`${styles.upvoteArrow} ${!user ? styles.disabled : ""}`}
          onClick={handleUpvoteClick}
        >
          <UpArrow className={userVote === "up" ? styles.filled : styles.outline} />
        </div>

        <div className={styles.voteCount}>{votes}</div>
        <div
          className={`${styles.downvoteArrow} ${!user ? styles.disabled : ""}`}
          onClick={handleDownvoteClick}
        >
          <DownArrow
            className={userVote === "down" ? styles.filled : styles.outline}
          />
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
