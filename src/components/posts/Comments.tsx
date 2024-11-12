import React, { useState, useEffect } from "react";
import { supabase } from "../../auth/supabaseClient"; // Ensure the correct import
import { RootState } from "@reduxjs/toolkit/query";
import { useDispatch, useSelector } from "react-redux";
import { fetchComments } from "../../features/postThunks";
import styles from "./Comments.module.css";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
import { Link } from "react-router-dom";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
  };
}

interface CommentsProps {
  postId: string;
}

const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const comments = useSelector(
    (state: RootState) => state.posts.selectedPostComments
  );
  const [newComment, setNewComment] = useState("");
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (postId && !comments) {
      dispatch(fetchComments({ postId }));
    }
  }, [postId, comments]);

  const handleAddComment = async () => {
    const { data, error } = await supabase
      .from("comments")
      .insert([{ content: newComment, post_id: postId, user_id: user.id }])
      .select();

    if (error) {
      setError(error.message);
    } else {
      const { error: updateError } = await supabase.rpc("increment_comments", {
        post_id: postId,
        increment_by: 1,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setComments([
          ...comments,
          { ...data[0], users: { username: user.username } },
        ]);
        setNewComment("");
      }
    }
  };

  if (!comments) return <div>No comments found.</div>;

  return (
    <div className={styles.commentsContainer}>
      <div className={styles.commentsHeader}>
        <h4>Top Comments</h4>
        <textarea
          className={styles.addComment}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type your comment..."
        />
        <button className={styles.addCommentButton} onClick={handleAddComment}>
          Submit
        </button>
      </div>
      {comments.map((comment) => (
        <div className={styles.commentContainer} key={comment.id}>
          <Link
            to={`/user/${comment.users.username}`}
            className={styles.username}
          >
            {comment.users.username}
          </Link>
          <span className={styles.date}>
            {formatTimeAgo(comment.created_at.toString())}
          </span>
          <p className={styles.content}>{comment.content}</p>
        </div>
      ))}
    </div>
  );
};

export default Comments;
