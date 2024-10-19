import React, { useState, useEffect } from "react";
import { supabase } from "../../auth/supabaseClient"; // Ensure the correct import
import { RootState } from "@reduxjs/toolkit/query";
import { useSelector } from "react-redux";

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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*, users(username)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setComments(data);
      }
      setLoading(false);
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    const { data, error } = await supabase
      .from("comments")
      .insert([{ content: newComment, post_id: postId, user_id: user.id }])
      .select();

    if (error) {
      setError(error.message);
    } else {
      const { error: updateError } = await supabase
        .rpc('increment_comments', { post_id: postId, increment_by: 1 });

      if (updateError) {
        setError(updateError.message);
      } else {
        setComments([...comments, { ...data[0], users: {username: user.username} }]);
        setNewComment("");
      }
    }
  };

  if (loading) return <p>Loading comments...</p>;
  if (error) return <p>Error loading comments: {error}</p>;

  console.log(comments)

  return (
    <div>
      <h3>Comments</h3>
      {comments.map((comment) => (
        <div key={comment.id}>
          <p>{comment.users.username} said:</p>
          <p>{comment.content}</p>
          <small>{new Date(comment.created_at).toLocaleString()}</small>
        </div>
      ))}

      <div>
        <h4>Add a comment</h4>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type your comment..."
        />
        <button onClick={handleAddComment}>Submit</button>
      </div>
    </div>
  );
};

export default Comments;
