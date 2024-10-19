import React, { useState, useEffect } from "react";
import styles from "./Post.module.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { supabase } from "../../auth/supabaseClient"; // Adjust the import path
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import { Link } from "react-router-dom";
import DownArrow from "../../assets/downArrowOutline.svg?react";
import UpArrow from "../../assets/upArrowOutline.svg?react";
import {
  handleVote
} from "../../features/postSlice";
import { handleVoteAsync, fetchUserVoteStatus } from "../../features/postThunks";

interface PostProps {
  id: string;
  title: string;
  author: string;
  created_at: number;
  thumbnail: string;
  number_of_comments: number;
  link: string;
  number_of_votes: number;
  circle?: string;
  home_page?: boolean;
  voteType: string;
}

const Post: React.FC<PostProps> = ({
  id,
  title,
  author,
  created_at,
  thumbnail,
  number_of_comments,
  link,
  number_of_votes,
  circle,
  home_page,
  voteType,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [userVoteType, setUserVoteType] = useState<"up" | "down" | "neutral">(
    "neutral"
  );
  const [postVotes, setPostVotes] = useState<number>(number_of_votes);
  const createdDate = formatTimeAgo(created_at.toString());
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchVoteStatus = async () => {
      if (user?.id) {
        const userId = user.id;
        const postId = id;
  
        try {
          // Dispatch the action to fetch the user vote status
          const voteStatus = await dispatch(fetchUserVoteStatus({ userId, postId })).unwrap();
          
          setUserVoteType(voteStatus)
        } catch (error) {
          console.error("Failed to fetch user vote status:", error);
        }
      }
    };
  
    fetchVoteStatus();
  }, [dispatch, id, user]);

  // Optimistic UI update for the vote
  const handleOptimisticVote = (voteType: "up" | "down" | "neutral") => {
    const previousVoteType = userVoteType;

    // Optimistically update the UI without waiting for the server
    dispatch(
      handleVote({ voteType, userId: user.id, postId: id, previousVoteType })
    );

    // Update local vote state to reflect the change immediately
    setUserVoteType(voteType);
    setPostVotes(
      voteType === "up"
        ? postVotes + 1
        : voteType === "down"
        ? postVotes - 1
        : postVotes
    );
  };

  const onVote = async (voteType: "up" | "down" | "neutral") => {
    if (user) {
      // Dispatch the async action to handle the vote
      const previousVoteType = userVoteType;

      try {
        const data = await dispatch(
          handleVoteAsync({
            voteType,
            userId: user.id,
            postId: id,
            previousVoteType: previousVoteType,
          })
        ).unwrap();

        if (data) {
          setUserVoteType(voteType);
          setPostVotes(data.updatedPost.vote_count); // Use the updated vote count from the payload
        }
      } catch (error) {
        console.error("Vote failed:", error);
      }
    } else {
      alert("You must be signed in to vote.");
    }
  };

  const handleUpvoteClick = () => {
    const newVoteType = userVoteType === "up" ? "neutral" : "up";
    handleOptimisticVote(newVoteType); // Optimistically update the UI first
    onVote(newVoteType); // Then update on the server side
  };

  const handleDownvoteClick = () => {
    const newVoteType = userVoteType === "down" ? "neutral" : "down";
    handleOptimisticVote(newVoteType); // Optimistically update the UI first
    onVote(newVoteType); // Then update on the server side
  };
  

  return (
    <div className={styles.postContainer}>
      {/* Left-side votes and upvote arrow */}
      <div className={styles.voteContainer}>
        <div
          className={`${styles.upvoteArrow} ${!user ? styles.disabled : ""}`}
          onClick={handleUpvoteClick}
        >
          <UpArrow
            className={userVoteType === "up" ? styles.filled : styles.outline}
          />
        </div>

        <div className={styles.voteCount}>{number_of_votes}</div>
        <div
          className={`${styles.downvoteArrow} ${!user ? styles.disabled : ""}`}
          onClick={handleDownvoteClick}
        >
          <DownArrow
            className={userVoteType === "down" ? styles.filled : styles.outline}
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
          {number_of_comments} comment{number_of_comments !== 1 && "s"}
        </Link>
      </div>
    </div>
  );
};

export default Post;
