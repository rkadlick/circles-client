// PostPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../auth/supabaseClient'; // Ensure this import is correct
import styles from './PostPage.module.css'; // Create a CSS file for styling

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>(); // Assuming the route is /post/:postId
  const [post, setPost] = useState<any>(null); // Adjust the type as needed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, users(username)')
        .eq('id', postId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setPost({
          ...data,
          author: data.users.username, // Extract the username
        });
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div className={styles.postPage}>
      <h1>{post.title}</h1>
      <p>Submitted by <a href="#">{post.author}</a> on {new Date(post.created_at).toLocaleString()}</p>
      <div>
        <img src={post.thumbnail} alt={post.title} />
      </div>
      <div>
        <p>{post.content}</p> {/* Adjust based on your data structure */}
      </div>
      <div>
        <p>Votes: {post.initialVotes}</p>
        <p>Comments: {post.num_comments}</p>
      </div>
    </div>
  );
};

export default PostPage;
