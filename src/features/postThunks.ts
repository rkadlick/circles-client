import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../auth/supabaseClient";
import { fetchCircleIdByName } from "./circleThunks";




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

export const fetchPostsByCircle = createAsyncThunk(
  "posts/fetchPostsByCircle",
  async (
    { circleId, user }: { circleId: string; user: any }
  ) => {
    // Step 1: If the user is logged in, fetch posts along with votes
    if (user) {
      const { data: postsWithVotes, error } = await supabase
        .from("posts_with_votes")
        .select("*, users(username)")
        .eq("circle_id", circleId)

      if (error) throw new Error(error.message);
      // Map `post_id` to `id`
      const posts = postsWithVotes.map(post => ({
        ...post,
        id: post.post_id
      }));
      return posts;
    }

    // Step 2: Fetch posts without votes if the user is not logged in
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*, users(username)")
      .eq("circle_id", circleId);

    if (error) throw new Error(error.message);

    return posts;
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

export const fetchAllPosts = createAsyncThunk(
  "posts/fetchAllPosts",
  async (user: any) => {
    // Step 1: If the user is logged in, fetch all posts along with votes
    if (user) {
      const { data: postsWithVotes, error } = await supabase
        .from("posts_with_votes")
        .select("*, users(username), circles(name)")

      if (error) throw new Error(error.message);
      // Map `post_id` to `id`
      const posts = postsWithVotes.map(post => ({
        ...post,
        id: post.post_id
      }));
      return posts;
    }

    // Step 2: Fetch all posts without votes if the user is not logged in
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
    voteType: 1 | -1 | 0;
    userId: string;
    postId: string;
    previousVoteType: 1 | -1 | 0;
  }) => {
    // Fetch the existing vote if any
    const { data: existingVote, error } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    if (error) throw error;

    let voteChange = 0;
    let newVoteType: 1 | -1 | 0 = voteType;

    if (!existingVote) {
      // No previous vote exists, insert new vote
      await supabase
        .from("votes")
        .insert([{ user_id: userId, post_id: postId, vote_type: voteType }]);

      // Determine the vote change based on the new vote
      voteChange = voteType;
    } else {
      // Existing vote found, determine whether to update or reset the vote
      newVoteType = existingVote.vote_type === voteType ? 0 : voteType;

      // Calculate vote change based on previous vote type and new vote type
      if (newVoteType === 1) {
        voteChange = previousVoteType === -1 ? 2 : 1;
      } else if (newVoteType === -1) {
        voteChange = previousVoteType === 1 ? -2 : -1;
      } else if (newVoteType === 0) {
        voteChange = previousVoteType === 1 ? -1 : previousVoteType === -1 ? 1 : 0;
      }

      // Update the existing vote in the database
      await supabase
        .from("votes")
        .update({ vote_type: newVoteType })
        .eq("user_id", userId)
        .eq("post_id", postId);
    }

    // Update the post's vote count in the database
    const { data: updatedPost, error: updateError } = await supabase.rpc(
      "increment_votes",
      { post_id: postId, increment_by: voteChange }
    );

    if (updateError) throw updateError;

    return {
      postId,
      updatedPost,
      voteType: newVoteType,
      previousVoteType: existingVote ? existingVote.vote_type : 0,
    };
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
