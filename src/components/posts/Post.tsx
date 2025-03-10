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
  handleVoteAsync,
  fetchUserVoteStatus,
} from "../../features/postThunks";
import { HiOutlineNewspaper } from "react-icons/hi";
import { voteHandler } from "../../utils/voteHandler";


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
  const [userVoteType, setUserVoteType] = useState<1 | -1 | 0>(voteType);
  const [postVotes, setPostVotes] = useState<number>(number_of_votes ?? 0);
  const createdDate = formatTimeAgo(created_at.toString());
  const dispatch = useDispatch();
  const commentCount = number_of_comments ?? 0;
  const postId = id;

  useEffect(() => {
    setUserVoteType(voteType)
  }, [voteType])

    // Function to handle votes
    const handleUserVote = (newVoteType: 1 | -1 | 0) => {
      voteHandler({
        newVoteType,
        user,
        userVoteType,
        postVotes,
        postId,
        dispatch,
        setUserVoteType,
        setPostVotes,
      });
      
    };

  
  return (
    <div className={styles.postContainer}>
      {/* Left-side votes and upvote arrow */}
      <div className={styles.voteContainer}>
        <div
          className={`${styles.upvoteArrow} ${!user ? styles.disabled : ""}`}
          onClick={() => handleUserVote(userVoteType === 1 ? 0 : 1)}
        >
          <UpArrow
            className={userVoteType === 1 ? styles.filled : styles.outline}
          />
        </div>

        <div className={styles.voteCount}>{postVotes}</div>
        <div
          className={`${styles.downvoteArrow} ${!user ? styles.disabled : ""}`}
          onClick={() => handleUserVote(userVoteType === -1 ? 0 : -1)}
        >
          <DownArrow
            className={userVoteType === -1 ? styles.filled : styles.outline}
          />
        </div>
      </div>

      {/* Post content */}
      {thumbnail ? (
        <img src={thumbnail} alt="Thumbnail" className={styles.thumbnail} />
      ) : (
        <HiOutlineNewspaper className={styles.textPostIcon} />
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
          Submitted by{" "}
          <Link to={`/user/${author}`} className={styles.authorLink}>
            {author}
          </Link>{" "}
          {createdDate} {home_page && "in "}
          {home_page && (
            <Link to={`/c/${circle}/`} className={styles.circleLink}>
              c/{circle}
            </Link>
          )}
        </div>

        <Link to={`/c/${circle}/post/${postId}`} className={styles.comments}>
          {number_of_comments} comment{commentCount !== 1 && "s"}
        </Link>
      </div>
    </div>
  );
};

export default Post;
