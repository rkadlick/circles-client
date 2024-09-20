import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../auth/supabaseClient'; // Assuming Supabase is your database
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const CreatePostPage: React.FC = () => {
  const { circleName } = useParams<{ circleName: string }>(); // Circle name from URL
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      setError('Title and Body are required.');
      return;
    }

    try {
		    // Step 1: Fetch the circleId based on the circleName
			const { data: circleData, error: circleError } = await supabase
			.from('circles')
			.select('id')
			.eq('name', circleName)
			.single();
	  
		  if (circleError || !circleData) {
			throw new Error('Circle not found');
		  }
	  
		  const circleId = circleData.id;

      const { data, error } = await supabase
        .from('posts')
        .insert([{ title, content, circle_id: circleId, created_by: user?.id }]);

      if (error) {
        throw new Error(error.message);
      }

      // Navigate to the circle page after creating the post
      navigate(`/c/${circleName}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user) {
    return <div>You must be logged in to create a post.</div>;
  }

  return (
    <div>
      <h2>Create a Post in {circleName} Circle</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="content">Body</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Create Post</button>
      </form>
    </div>
  );
};

export default CreatePostPage;
