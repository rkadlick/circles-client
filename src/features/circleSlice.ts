import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../auth/supabaseClient';

interface CircleState {
  circles: Array<{ id: string; name: string; description: string }>;
  posts: Array<{ id: string; title: string; content: string }>; // Add posts array
  status: 'idle' | 'loading' | 'failed';
}

const initialState: CircleState = {
  circles: [],
  posts: [],  // Initialize posts state
  status: 'idle',
};

// Create Circle Action
export const createCircle = createAsyncThunk(
  'circles/createCircle',
  async ({ name, description, created_by }: { name: string; description: string; created_by: string; }) => {
    const { data, error } = await supabase
      .from('circles')
      .insert([{ name, description, created_by }])
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
);

// Fetch Posts by Circle Action
export const fetchPostsByCircle = createAsyncThunk(
  'circles/fetchPostsByCircle',
  async (circleName: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('circle_name', circleName); // Assuming your 'posts' table has a circle_name column

    if (error) throw new Error(error.message);

    return data;
  }
);

const circleSlice = createSlice({
  name: 'circles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Circle Reducers
      .addCase(createCircle.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createCircle.fulfilled, (state, action) => {
        state.status = 'idle';
        state.circles.push(action.payload);
      })
      .addCase(createCircle.rejected, (state) => {
        state.status = 'failed';
      })
      
      // Fetch Posts by Circle Reducers
      .addCase(fetchPostsByCircle.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPostsByCircle.fulfilled, (state, action) => {
        state.status = 'idle';
        state.posts = action.payload; // Store the fetched posts in the posts array
      })
      .addCase(fetchPostsByCircle.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default circleSlice.reducer;
