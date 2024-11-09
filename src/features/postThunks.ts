import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../auth/supabaseClient";
import { fetchCircleIdByName } from "./circleSlice";


const fetchUserVotes = createAsyncThunk(
  "posts/fetchUserVotes",
  async(posts : []) => {
    const postIds = posts.map(post => post.id);

    const { data: votes, error } = await supabase
      .from('votes')
      .select('*')
      .in('post_id', postIds);

      if (error) {
        console.error('Error fetching votes: ', error.message);
      } else {
        // Attach votes to posts
        const postsWithVotes = posts.map(post => ({
          ...post,
          votes: votes.filter(vote => vote.post_id === post.id)
        }));
        return postsWithVotes
      }
  }
)

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
  async ({ circleName, user }: { circleName: string, user: any }, { dispatch }) => {    let finalPosts;
    const circleData = await dispatch(fetchCircleIdByName(circleName)).unwrap();
    console.log(circleName)

    const { data, error } = await supabase
      .from("posts")
      .select("*, users(username)")
      .eq("circle_id", circleData.id);

    if (error) throw new Error(error.message);

    if(user) {
      finalPosts = fetchUserVotes(data, user)
    }

    return finalPosts;
  }
);

export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUserPosts",
  async (user: {id: string}) => {

    console.log(user)
    const { data, error } = await supabase
      .from("posts")
      .select("*, users(username)")
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    console.log(data)

    return data;
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

    return data;
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
  async (
    { userId, postId }: { userId: string; postId: string },
    { rejectWithValue }
  ) => {
    const { data, error } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    if (error) {
      return rejectWithValue(error.message);
    }
    return data?.vote_type || "neutral"; // Return the vote type or neutral if none
  }
);
