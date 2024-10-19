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
    {
      title,
      content,
      link,
      circleName,
      userId,
    }: {
      title: string;
      content: string;
      link: string;
      circleName: string;
      userId: string;
    },
    { dispatch }
  ) => {
    // Fetch circle ID by name
    const circleData = await dispatch(fetchCircleIdByName(circleName)).unwrap();

    console.log(circleData);

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          title,
          content,
          link,
          circle_id: circleData.id,
          user_id: userId,
        },
      ])
      .select("*");

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

export const handleVoteAsync = createAsyncThunk(
  "posts/handleVote",
  async ({
    voteType,
    userId,
    postId,
    previousVoteType,
  }: {
    voteType: string;
    userId: string;
    postId: string;
    previousVoteType: string;
  }) => {
    const { data: existingVote, error } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    if (error || !existingVote) {
      // No previous vote, insert new vote
      await supabase
        .from("votes")
        .insert([{ user_id: userId, post_id: postId, vote_type: voteType }]);

      // Calculate vote change (upvote or downvote)
      const voteChange = voteType === "up" ? 1 : -1;

      // Update post's vote count in one step
      const { data: updatedPost, error: updateError } = await supabase.rpc(
        "increment_votes",
        { post_id: postId, increment_by: voteChange }
      );

      if (updateError) throw updateError;

      return { postId, updatedPost, voteType, previousVoteType: "neutral" };
    } else {
      // Existing vote, update or reset
      const newVoteType =
        existingVote.vote_type === voteType ? "neutral" : voteType;
      // Calculate vote change based on the previous vote
      let voteChange = 0;
      if (newVoteType === "up") {
        voteChange = previousVoteType === "down" ? 2 : 1;
      } else if (newVoteType === "down") {
        voteChange = previousVoteType === "up" ? -2 : -1;
      } else {
        voteChange =
          previousVoteType === "up" ? -1 : previousVoteType === "down" ? 1 : 0;
      }

      // Update the user's vote
      await supabase
        .from("votes")
        .update({ vote_type: newVoteType })
        .eq("user_id", userId)
        .eq("post_id", postId);

      // Update the post's vote count in one step
      const { data: updatedPost, error: updateError } = await supabase.rpc(
        "increment_votes",
        { post_id: postId, increment_by: voteChange }
      );


      if (updateError) console.log(updateError);

      return {
        postId,
        updatedPost,
        voteType: newVoteType,
        previousVoteType: existingVote.vote_type,
      };
    }
  }
);

export const fetchUserVoteStatus = createAsyncThunk(
  "posts/fetchUserVoteStatus",
  async ({ userId, postId }: { userId: string; postId: string }, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    if (error) {
      return rejectWithValue(error.message);
    }
    return data?.vote_type || "neutral";  // Return the vote type or neutral if none
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
      const { voteType, postId, previousVoteType } = action.payload;
      const post = state.posts.find((post) => post.id === postId);

      if (!post) return;

      // Adjust the vote count based on vote type and previous vote
      if (voteType === "up") {
        if (previousVoteType === "down") {
          post.number_of_votes += 2;
        } else if (previousVoteType === "neutral") {
          post.number_of_votes += 1;
        }
        post.userVote = "up";  // Set current vote as up
      } else if (voteType === "down") {
        if (previousVoteType === "up") {
          post.number_of_votes -= 2;
        } else if (previousVoteType === "neutral") {
          post.number_of_votes -= 1;
        }
        post.userVote = "down";  // Set current vote as down
      } else {
        // Reset vote to neutral
        if (previousVoteType === "up") {
          post.number_of_votes -= 1;
        } else if (previousVoteType === "down") {
          post.number_of_votes += 1;
        }
        post.userVote = "neutral";  // Set current vote as neutral
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
      })
      .addCase(handleVoteAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(handleVoteAsync.fulfilled, (state, action) => {
        const { postId, updatedPost, voteType, previousVoteType } = action.payload;
        // Update the post with new data from async vote handling
        const post = state.posts.find((post) => post.id === postId);
        if (post) {
          post.number_of_votes = updatedPost[0].number_of_votes;  // Update the vote count
          post.userVote = voteType;  // Update the user's current vote
        }

        state.status = "idle";  // Set status to idle after successful voting
      })
      .addCase(handleVoteAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchUserVoteStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserVoteStatus.fulfilled, (state, action) => {
        state.status = "idle";
        const { postId, userVoteType } = action.payload;
        const post = state.posts.find((post) => post.id === postId);
        if (post) {
          post.userVote = userVoteType;  // Update the user's vote status
        }
      })
      .addCase(fetchUserVoteStatus.rejected, (state, action) => {
        state.status = "failed";
        console.error(action.payload);  // Handle error if needed
      });
  },
});


export const { handleVote } = postsSlice.actions;

export default postsSlice.reducer;
