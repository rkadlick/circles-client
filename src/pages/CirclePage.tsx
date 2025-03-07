import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../auth/supabaseClient"; // Assuming you have Supabase setup
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store"; // Ensure correct store import
import Post from "../components/posts/Post";
import { checkCircleExists } from "../features/circleThunks";
import styles from "./CirclePage.module.css";
import { fetchPostsByCircle } from "../features/postThunks";
import Sidebar from "../components/Sidebar";
import { sortPosts } from "../utils/sortPosts";
import CirclePageHeader from "../components/header/CirclePageHeader";

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
    if (circleName) {
      dispatch(checkCircleExists(circleName));
    }
  }, [circleName, dispatch]);

  useEffect(() => {
    //console.log("fetchPostif: " + circleExists);
    if (circleExists && circleId) {
      //console.log("fetchPostsif: " + circleName);
      dispatch(fetchPostsByCircle({ circleId, user })); // Fetch posts if circle exists
    }
  }, [user, circleExists, circleId, dispatch]);

  useEffect(() => {
    if (posts.length > 0) {
      const newSortedPosts = sortPosts(posts, sortOrder); // Use the sorting function
      setSortedPosts(newSortedPosts);
    }
    if (posts.length === 0){
      setSortedPosts([])
    }
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
  
  /*sortedPosts.map((post) => {
    console.log(post)
  })*/

  return (
    <div className={styles.page}>
      <CirclePageHeader />
      <div className={styles.postsContainer}>
        {sortedPosts.length === 0 ? (
          <p>No posts found...</p>
        ) : (
        sortedPosts.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            title={post.title}
            author={post.users.username}
            created_at={post.created_at}
            thumbnail={post.thumbnail}
            number_of_comments={post.number_of_comments}
            link={post.link}
            circle={circleName}
            number_of_votes={post.number_of_votes} // display votes as well
            voteType={post.user_vote}
          />
        )))}
      </div>
    </div>
  );
};

export default CirclePage;
