import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../auth/supabaseClient"; // Assuming you have Supabase setup
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store"; // Ensure correct store import
import Post from "../components/posts/Post";
import {
  checkCircleExists
} from "../features/circleSlice";
import styles from "./CirclePage.module.css";
import { fetchPostsByCircle } from "../features/postThunks";
import Sidebar from "../components/Sidebar";
import { sortPosts } from "../utils/sortPosts";

interface CirclePageProps {
  sortOrder: string;
}

const CirclePage: React.FC<CirclePageProps> = ({ sortOrder }) => {
  const { circleName } = useParams<{ circleName: string }>(); // Assuming the URL is /c/:circleName

  const navigate = useNavigate();
  const circleExists = useSelector(
    (state: RootState) => state.circle.circleExists
  );
  const user = useSelector((state: RootState) => state.auth.user); // Check if the user is logged in
  const userId = user?.id;
  const posts = useSelector((state: RootState) => state.posts.posts); // Fetch posts under this circle
  const circleId = useSelector((state: RootState) => state.circle.circleId);
  const dispatch = useDispatch();
  const [sortedPosts, setSortedPosts] = useState(posts); // Use state to hold sorted posts
  const [reload, setReload] = useState(false); // Add this state

  useEffect(() => {
    console.log(circleName)
    dispatch(checkCircleExists(circleName)); // Check if circle exists
  }, [circleName, dispatch]);

  useEffect(() => {
    console.log(circleExists)
    if (circleExists) {
      dispatch(fetchPostsByCircle(circleName, user)); // Fetch posts if circle exists
    }
  }, [circleExists, circleName, dispatch]);

  useEffect(() => {
    const newSortedPosts = sortPosts(posts, sortOrder); // Use the sorting function
    setSortedPosts(newSortedPosts);
  }, [posts, sortOrder]);

  if (circleExists === null) {
    return <div>Loading...</div>; // Show a loading state while checking
  }

  if (!circleExists) {
    return (
      <div>
        <h2>This Circle does not exist.</h2>
        {user ? (
          <div>
            <p>
              It seems this circle hasn't been created yet. Want to create it?
            </p>
            <button onClick={() => navigate("/create-circle")}>
              Create Circle
            </button>
          </div>
        ) : (
          <p>You need to log in to create a circle.</p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.postsContainer}>
        {sortedPosts.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            title={post.title}
            author={post.author}
            created_at={post.created_at}
            thumbnail={post.thumbnail}
            number_of_comments={post.number_of_comments}
            link={post.link}
            circle={circleName}
            number_of_votes={post.number_of_votes} // display votes as well
            voteType={""}          />
        ))}
      </div>
      <Sidebar />
    </div>
  );
};

export default CirclePage;
