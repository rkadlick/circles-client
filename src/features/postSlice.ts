import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchPostsByCircle,
  fetchAllPosts,
  handleVoteAsync,
  fetchUserVoteStatus,
} from "./postThunks";

interface PostState {
  posts: Array<{
    id: string;
    title: string;
    author: string;
    created_at: number;
    thumbnail: string;
    link: string;
    number_of_votes: number;
    number_of_comments: number;
    circles?: object;
    userVote: string;
  }>;
  status: "idle" | "loading" | "failed";
}

const initialState: PostState = {
  posts: [],
  status: "idle",
};

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
        post.userVote = "up"; // Set current vote as up
      } else if (voteType === "down") {
        if (previousVoteType === "up") {
          post.number_of_votes -= 2;
        } else if (previousVoteType === "neutral") {
          post.number_of_votes -= 1;
        }
        post.userVote = "down"; // Set current vote as down
      } else {
        // Reset vote to neutral
        if (previousVoteType === "up") {
          post.number_of_votes -= 1;
        } else if (previousVoteType === "down") {
          post.number_of_votes += 1;
        }
        post.userVote = "neutral"; // Set current vote as neutral
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
        const { postId, updatedPost, voteType, previousVoteType } =
          action.payload;
        // Update the post with new data from async vote handling
        const post = state.posts.find((post) => post.id === postId);
        if (post) {
          post.number_of_votes = updatedPost[0].number_of_votes; // Update the vote count
          post.userVote = voteType; // Update the user's current vote
        }

        state.status = "idle"; // Set status to idle after successful voting
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
          post.userVote = userVoteType; // Update the user's vote status
        }
      })
      .addCase(fetchUserVoteStatus.rejected, (state, action) => {
        state.status = "failed";
        console.error(action.payload); // Handle error if needed
      });
  },
});

export const { handleVote } = postsSlice.actions;

export default postsSlice.reducer;
