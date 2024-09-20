import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../auth/supabaseClient";

interface CircleState {
  circles: Array<{ id: string; name: string; description: string }>;
  posts: Array<{
    id: string;
    title: string;
    author: string;
    created_utc: number;
    thumbnail: string;
    num_comments: number;
    permalink: string;
    initialVotes: number;
  }>;
  circleExists: boolean; // Add to track if circle exists
  circleId: string | null; // Add to store the circle ID
  status: "idle" | "loading" | "failed";
}

const initialState: CircleState = {
  circles: [],
  posts: [],
  circleExists: false,
  circleId: null,
  status: "idle",
};

// Create Circle Action
export const createCircle = createAsyncThunk(
  "circles/createCircle",
  async ({
    name,
    description,
    created_by,
  }: {
    name: string;
    description: string;
    created_by: string;
  }) => {
    const { data, error } = await supabase
      .from("circles")
      .insert([{ name, description, created_by }])
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
);

// Check Circle Exists Action
export const checkCircleExists = createAsyncThunk(
  "circles/checkCircleExists",
  async (circleName: string) => {
    const { data, error } = await supabase
      .from("circles")
      .select("id, name")
      .eq("name", circleName)
      .single();

    if (error) throw new Error(error.message);
    return !!data; // Return true if circle exists, false otherwise
  }
);

// Fetch CircleId by name
export const fetchCircleIdByName = createAsyncThunk(
  "circles/fetchCircleIdByName",
  async (circleName: string) => {
    const { data, error } = await supabase
      .from("circles")
      .select("id")
      .eq("name", circleName)
      .single();

    if (error) throw new Error(error.message);
    return data.id; // Return the circle ID
  }
);

// Fetch Posts by Circle Action
export const fetchPostsByCircle = createAsyncThunk(
  "circles/fetchPostsByCircle",
  async (circleName: string, { dispatch }) => {
    // Fetch circle ID by name
    const circleId = await dispatch(fetchCircleIdByName(circleName)).unwrap();

    // Fetch posts with usernames by joining posts and users tables
    const { data, error } = await supabase
      .from("posts")
      .select("*, users(username)")
      .eq("circle_id", circleId)
      
    console.log(data);
    if (error) throw new Error(error.message);
    
    return data.map((post: any) => ({
      ...post,
      author: post.users.username, // Extract the username
    }));
  }
);

const circleSlice = createSlice({
  name: "circles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Circle Reducers
      .addCase(createCircle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createCircle.fulfilled, (state, action) => {
        state.status = "idle";
        state.circles.push(action.payload);
      })
      .addCase(createCircle.rejected, (state) => {
        state.status = "failed";
      })
      // Fetch Posts by Circle Reducers
      .addCase(fetchPostsByCircle.pending, (state) => {
        console.log('loaading')
        state.status = "loading";
      })
      .addCase(fetchPostsByCircle.fulfilled, (state, action) => {
        console.log('idle')
        state.status = "idle";
        state.posts = action.payload;
      })
      .addCase(fetchPostsByCircle.rejected, (state) => {
        console.log("failed")
        state.status = "failed";
      })
      .addCase(fetchCircleIdByName.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCircleIdByName.fulfilled, (state, action) => {
        state.status = "idle";
        state.circleId = action.payload; // Store the fetched circle ID
        state.circleExists = true; // Mark circle as existing
      })
      .addCase(fetchCircleIdByName.rejected, (state) => {
        state.status = "failed";
        state.circleExists = false; // If fetching failed, mark as not existing
      })
      // Check Circle Exists Reducers
      .addCase(checkCircleExists.fulfilled, (state, action) => {
        state.circleExists = action.payload; // Set circleExists based on the result
      })
      .addCase(checkCircleExists.rejected, (state) => {
        state.circleExists = false; // Reset to false on error
      });
  },
});

export default circleSlice.reducer;
