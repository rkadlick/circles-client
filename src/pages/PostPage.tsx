// PostPage.tsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../auth/supabaseClient"; // Ensure this import is correct
import styles from "./PostPage.module.css"; // Create a CSS file for styling
import Comments from "../components/posts/Comments"; // Import the Comments component
import { fetchPost, handleVoteAsync } from "../features/postThunks";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@reduxjs/toolkit/query";
import { formatTimeAgo } from "../utils/formatTimeAgo";
import DownArrow from "../assets/downArrowOutline.svg?react";
import UpArrow from "../assets/upArrowOutline.svg?react";
import { resetSelectedPost } from "../features/postSlice";
import { voteHandler } from "../utils/voteHandler";

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>(); // Assuming the route is /post/:postId
  const selectedPost = useSelector(
    (state: RootState) => state.posts.selectedPost
  );
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [userVoteType, setUserVoteType] = useState<1 | -1 | 0>(
    selectedPost?.user_vote
  );
  const [postVotes, setPostVotes] = useState<number>(
    selectedPost?.number_of_votes ?? 0
  );

  useEffect(() => {
    if (postId && user) {
      dispatch(fetchPost({ postId, user }));
    }
    if(postId && !user){
      dispatch(fetchPost({postId}))
    }
    // Cleanup to reset selectedPost on unmount
    return () => {
      dispatch(resetSelectedPost());
    };
  }, [postId,user, dispatch]);
  
  useEffect(() => {
    if (selectedPost) {
      setPostVotes(selectedPost.number_of_votes);
      setUserVoteType(selectedPost.user_vote)
    }
  }, [selectedPost, user]);

  useEffect(() => {
    setUserVoteType(selectedPost?.voteType);
  }, [selectedPost?.voteType]);

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

  if (selectedPost === null) return <div>Post not found...</div>;

  return (
    <div className={styles.postPage}>
      <div className={styles.postHeader}>
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
            className={`${styles.downvoteArrow} ${
              !user ? styles.disabled : ""
            }`}
            onClick={() => handleUserVote(userVoteType === -1 ? 0 : -1)}
          >
            <DownArrow
              className={userVoteType === -1 ? styles.filled : styles.outline}
            />
          </div>
        </div>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>{selectedPost.title}</h1>
          <p className={styles.meta}>
            Submitted by{" "}
            <Link
              to={`/user/${selectedPost.users.username}`}
              className={styles.authorLink}
            >
              {selectedPost.users.username}
            </Link>{" "}
            {formatTimeAgo(selectedPost.created_at.toString())}
          </p>
          <p className={styles.content}>{selectedPost.content}</p>{" "}
        </div>
      </div>
      <Comments postId={postId} />
    </div>
  );
};

export default PostPage;
