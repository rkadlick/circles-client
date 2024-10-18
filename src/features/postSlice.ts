import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../auth/supabaseClient";
import { RootState } from "../redux/store";
import { fetchCircleIdByName } from "./circleSlice";

interface PostState {
  posts: Array<{
    id: string;
    title: string;
    author: string;
    created_at: number;
    thumbnail: string;
    permalink: string;
    number_of_votes: number;
    num_of_comments: number;
    circle?: string;
    userVote: string;
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
    .from("comments")
    .select("*", { count: "exact" })
    .eq("post_id", postId);

  if (error) throw new Error(error.message);

  return count || 0;
};

// Create Post in a Circle
export const createPostInCircle = createAsyncThunk(
  "posts/createPostInCircle",
  async (
    { title, content, link, circleName, userId }: 
    { title: string, content: string, link: string, circleName: string, userId: string },
    { dispatch }
  ) => {
    // Fetch circle ID by name
    const circleData = await dispatch(fetchCircleIdByName(circleName)).unwrap();

    console.log(circleData)

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          title,
          content,
          link,
          circle_id: circleData.id,
          user_id: userId
        }
      ])
      .select('*');

      console.log("Response data:", data);
      console.log("Insert error:", error);
      
      if (error) {
        console.error("Error inserting post:", error.message);
      } else {
        console.log("Successfully inserted post:", data);
        // Optionally redirect or update state here
      }

    return data[0]; // Return the created post
  }
);

// Fetch Posts by Circle Action with comment counts
export const fetchPostsByCircle = createAsyncThunk(
  "posts/fetchPostsByCircle",
  async (circleName: string, { dispatch }) => {
    const circleData = await dispatch(fetchCircleIdByName(circleName)).unwrap();

    const { data, error } = await supabase
      .from("posts")
      .select("*, users(username)")
      .eq("circle_id", circleData.id);

    if (error) throw new Error(error.message);

    const postsWithComments = await Promise.all(
      data.map(async (post: any) => ({
        ...post,
        author: post.users.username,
        circle: circleName,
        num_of_comments: await getNumberOfComments(post.id),
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

    const postsWithComments = await Promise.all(
      data.map(async (post: any) => ({
        ...post,
        author: post.users.username,
        circle: post.circles.name,
        num_of_comments: await getNumberOfComments(post.id),
      }))
    );

    return postsWithComments;
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    handleVote: (
      state,
      action: PayloadAction<{
        voteType: "up" | "down";
        userId: string;
        postId: string;
        previousVoteType: "up" | "down" | "neutral";
      }>
    ) => {
      const { voteType, userId, postId, previousVoteType } = action.payload;
      const post = state.posts.find((post) => post.id === postId);

      if (!post) return;

      if (voteType === "up") {
        if (previousVoteType === "down") {
          post.number_of_votes += 2;
        } else if (previousVoteType === "neutral") {
          post.number_of_votes += 1;
        }
        post.userVote = "up";
      } else if (voteType === "down") {
        if (previousVoteType === "up") {
          post.number_of_votes -= 2;
        } else if (previousVoteType === "neutral") {
          post.number_of_votes -= 1;
        }
        post.userVote = "down";
      } else {
        if (previousVoteType === "up") {
          post.number_of_votes -= 1;
        } else if (previousVoteType === "down") {
          post.number_of_votes += 1;
        }
        post.userVote = "neutral";
      }
    },
  },
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

export const { handleVote } = postsSlice.actions;

export default postsSlice.reducer;
