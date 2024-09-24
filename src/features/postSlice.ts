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
    permalink: string;
    number_of_upvotes: number;
    num_of_comments: number;
    circle?: string;
  }>;
  status: "idle" | "loading" | "failed";
}

const initialState: PostState = {
  posts: [],
  status: "idle",
};

// Helper function to get the number of comments for a post
const getNumberOfComments = async (postId: string) => {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact' })
    .eq('post_id', postId);

  if (error) throw new Error(error.message);

  return count || 0;
};

// Fetch Posts by Circle Action with comment counts
export const fetchPostsByCircle = createAsyncThunk(
  "posts/fetchPostsByCircle",
  async (circleName: string, { dispatch }) => {
    // Fetch circle ID by name
    const circleData = await dispatch(fetchCircleIdByName(circleName)).unwrap();

    const { data, error } = await supabase
      .from("posts")
      .select("*, users(username)")
      .eq("circle_id", circleData.id);

    if (error) throw new Error(error.message);

    // Fetch number of comments for each post
    const postsWithComments = await Promise.all(
      data.map(async (post: any) => ({
        ...post,
        author: post.users.username,
        circle: circleName,
        num_of_comments: await getNumberOfComments(post.id), // Fetch comment count
      }))
    );

    return postsWithComments;
  }
);

// Fetch All Posts with comment counts
export const fetchAllPosts = createAsyncThunk(
  "posts/fetchAllPosts",
  async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, users(username), circles(name)");

    if (error) throw new Error(error.message);

    // Fetch number of comments for each post
    const postsWithComments = await Promise.all(
      data.map(async (post: any) => ({
        ...post,
        author: post.users.username,
        circle: post.circles.name,
        num_of_comments: await getNumberOfComments(post.id), // Fetch comment count
      }))
    );

    return postsWithComments;
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsByCircle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPostsByCircle.fulfilled, (state, action) => {
        state.status = "idle";
        state.posts = action.payload;
      })
      .addCase(fetchPostsByCircle.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchAllPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.status = "idle";
        state.posts = action.payload;
      })
      .addCase(fetchAllPosts.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default postSlice.reducer;
