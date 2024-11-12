import { Dispatch } from "@reduxjs/toolkit";
import { handleVoteAsync } from "../features/postThunks"; // Adjust the import path as needed
import { User } from "../types"; // Adjust if you have a User type defined

interface HandleVoteParams {
  newVoteType: 1 | -1 | 0;
  user: User | null;
  userVoteType: 1 | -1 | 0;
  postVotes: number;
  postId: string;
  dispatch: Dispatch;
  setUserVoteType: React.Dispatch<React.SetStateAction<1 | -1 | 0>>;
  setPostVotes: React.Dispatch<React.SetStateAction<number>>;
}

export const voteHandler = async ({
  newVoteType,
  user,
  userVoteType,
  postVotes,
  postId,
  dispatch,
  setUserVoteType,
  setPostVotes,
}: HandleVoteParams) => {
  if (!user) {
    alert("You must be signed in to vote.");
    return;
  }

  const previousVoteType = userVoteType;
  let updatedVotes = postVotes;

  // Adjust the vote count optimistically based on user's action
  if (newVoteType === 1) {
    updatedVotes += previousVoteType === -1 ? 2 : previousVoteType === 0 ? 1 : 0;
  } else if (newVoteType === -1) {
    updatedVotes -= previousVoteType === 1 ? 2 : previousVoteType === 0 ? 1 : 0;
  } else {
    updatedVotes += previousVoteType === 1 ? -1 : previousVoteType === -1 ? 1 : 0;
  }

  // Optimistically update the UI
  setUserVoteType(newVoteType);
  setPostVotes(updatedVotes);

  // Dispatch the async action to update the database
  try {
    const response = await dispatch(
      handleVoteAsync({
        voteType: newVoteType,
        userId: user.id,
        postId,
        previousVoteType,
      })
    ).unwrap();

    if (response) {
      setPostVotes(response.updatedPost[0].number_of_votes);
      setUserVoteType(response.voteType);
    }
  } catch (error) {
    console.error("Vote failed:", error);
    // Revert the UI changes if the server update fails
    setUserVoteType(previousVoteType);
    setPostVotes(postVotes);
  }

  
};
