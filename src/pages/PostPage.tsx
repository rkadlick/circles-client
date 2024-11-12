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

  // Function to handle votes
  const handleVote = async (newVoteType: 1 | -1 | 0) => {
    if (!user) {
      alert("You must be signed in to vote.");
      return;
    }
    const previousVoteType = userVoteType;
    let updatedVotes = postVotes;

    // Adjust the vote count optimistically based on user's action
    if (newVoteType === 1) {
      updatedVotes +=
        previousVoteType === -1 ? 2 : previousVoteType === 0 ? 1 : 0;
    } else if (newVoteType === -1) {
      updatedVotes -=
        previousVoteType === 1 ? 2 : previousVoteType === 0 ? 1 : 0;
    } else {
      updatedVotes +=
        previousVoteType === 1 ? -1 : previousVoteType === -1 ? 1 : 0;
    }
    // Optimistically update the UI
    setUserVoteType(newVoteType);
    setPostVotes(updatedVotes);
    // Dispatch the async action to update the database
    try {
      const response = await dispatch(
        handleVoteAsync({
          voteType: newVoteType,
          userId: user.id,
          postId: id,
          previousVoteType,
        })
      ).unwrap();

      if (response) {
        setPostVotes(response.updatedPost[0].number_of_votes);
        setUserVoteType(response.voteType);
      }
    } catch (error) {
      console.error("Vote failed:", error);
      // Revert the UI changes if the server update fails
      setUserVoteType(previousVoteType);
      setPostVotes(postVotes);
    }
  };

  if (selectedPost === null) return <div>Post not found...</div>;

  return (
    <div className={styles.postPage}>
      <div className={styles.postHeader}>
        <div className={styles.voteContainer}>
          <div
            className={`${styles.upvoteArrow} ${!user ? styles.disabled : ""}`}
            onClick={() => handleVote(userVoteType === 1 ? 0 : 1)}
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
            onClick={() => handleVote(userVoteType === -1 ? 0 : -1)}
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
