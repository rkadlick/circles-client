import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../auth/supabaseClient";
import { fetchCircleIdByName } from "./circleSlice";

interface PostState {
  posts: Array<{
    id: string;
    title: string;
    author: string;
    created_at: number;
    thumbnail: string;
    num_comments: number;
    permalink: string;
    number_of_upvotes: number;
	circle?: string;
  }>;
  status: "idle" | "loading" | "failed";
}

const initialState: PostState = {
  posts: [],
  status: "idle",
};

// Fetch Posts by Circle Action
export const fetchPostsByCircle = createAsyncThunk(
	"posts/fetchPostsByCircle",
	async (circleName: string, { dispatch }) => {
	  // Fetch circle ID by name
	  const circleId = await dispatch(fetchCircleIdByName(circleName)).unwrap();
  
	  const { data, error } = await supabase
		.from("posts")
		.select("*, users(username)")
		.eq("circle_id", circleId);
		
	  if (error) throw new Error(error.message);
	  
	  return data.map((post: any) => ({
		...post,
		author: post.users.username,
    circle: circleName
	  }));
	}
  );

export const fetchAllPosts = createAsyncThunk(
  "posts/fetchAllPosts",
  async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, users(username), circles(name)");
      
    if (error) throw new Error(error.message);
    
    return data.map((post: any) => ({
      ...post,
      author: post.users.username,
      circle: post.circles.name,
    }));
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsByCircle.pending, (state) => { state.status = "loading"; })
      .addCase(fetchPostsByCircle.fulfilled, (state, action) => {
        state.status = "idle";
        state.posts = action.payload;
      })
      .addCase(fetchPostsByCircle.rejected, (state) => { state.status = "failed"; })
      .addCase(fetchAllPosts.pending, (state) => { state.status = "loading"; })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.status = "idle";
        state.posts = action.payload;
      })
      .addCase(fetchAllPosts.rejected, (state) => { state.status = "failed"; });
  },
});

export default postSlice.reducer;
