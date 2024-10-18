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


/*export const handleVote = createAsyncThunk(
  "posts/handleVote",
  async ({
    voteType,
    userId,
    postId,
    previousVoteType
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
      .single();

      if(error){
        console.log(error)
      }

      if(existingVote === null){
        await supabase
        .from("votes")
        .insert([{ user_id: userId, post_id: postId, vote_type: voteType }]);
        return { postId, voteType, previousVoteType: 'neutral' }; // No previous vote
      }

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // If the same vote, reset vote (neutral state)
        await supabase
          .from("votes")
          .update({ vote_type: 'neutral' })
          .eq("user_id", userId)
          .eq("post_id", postId);
        return { postId, voteType: 'neutral', previousVoteType: existingVote.vote_type };
      } else {
        // Change vote type
        await supabase
          .from("votes")
          .update({ vote_type: voteType })
          .eq("user_id", userId)
          .eq("post_id", postId);
        return { postId, voteType, previousVoteType: existingVote.vote_type };
      }
    } else {
      // New vote
      await supabase
        .from("votes")
        .insert([{ user_id: userId, post_id: postId, vote_type: voteType }]);
      return { postId, voteType, previousVoteType: 'neutral' }; // No previous vote
    }
  }
); */


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

      // Update the user's vote and adjust the upvote count
      if (voteType === "up") {
        if (previousVoteType === "down") {
          post.number_of_upvotes += 2; // Switching from down to up
        } else if (previousVoteType === "neutral") {
          post.number_of_upvotes += 1; // Voting up from neutral
        }
        post.userVote = "up";
      } else if (voteType === "down") {
        if (previousVoteType === "up") {
          post.number_of_upvotes -= 2; // Switching from up to down
        } else if (previousVoteType === "neutral") {
          post.number_of_upvotes -= 1; // Voting down from neutral
        }
        post.userVote = "down";
      } else {
        // Resetting the vote if user clicks neutral
        if (previousVoteType === "up") {
          post.number_of_upvotes -= 1;
        } else if (previousVoteType === "down") {
          post.number_of_upvotes += 1;
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
      })
      // Handle vote updates in postsSlice
      /*.addCase(handleVote.fulfilled, (state, action) => {
        const { postId, voteType, previousVoteType } = action.payload;

        const post = state.posts.find((post) => post.id === postId);
        if (post) {
          // Vote calculation logic
          if (previousVoteType === "up" && voteType === "down") {
            post.number_of_upvotes -= 2;
          } else if (previousVoteType === "down" && voteType === "up") {
            post.number_of_upvotes += 2;
          } else if (previousVoteType === "neutral" && voteType === "up") {
            post.number_of_upvotes += 1;
          } else if (previousVoteType === "neutral" && voteType === "down") {
            post.number_of_upvotes -= 1;
          } else if (previousVoteType === "up" && voteType === "neutral") {
            post.number_of_upvotes -= 1;
          } else if (previousVoteType === "down" && voteType === "neutral") {
            post.number_of_upvotes += 1;
          }

          // Update the user's vote on the post
          post.userVote = voteType; // Store the user's current vote in the post
          console.log(post.userVote)
        }
      })
      .addCase(handleVote.rejected, (state, action) => {
        console.error("Vote handling failed:", action.error.message);
      });*/
  },
});

export const { handleVote } = postsSlice.actions;

export default postsSlice.reducer;
