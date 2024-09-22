import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../auth/supabaseClient"; // Assuming you have Supabase setup
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store"; // Ensure correct store import
import Post from "../components/posts/Post";
import { checkCircleExists, checkUserJoinedCircle, fetchCircleIdByName, userJoinCircle, userLeaveCircle } from "../features/circleSlice";
import styles from "./CirclePage.module.css";
import { fetchPostsByCircle } from "../features/postSlice";
import Sidebar from "../components/Sidebar";
import { sortPosts } from "../utils/sortPosts";


interface CirclePageProps {
  sortOrder: string;
}

const CirclePage: React.FC<CirclePageProps> = ({ sortOrder }) => {
  const { circleName } = useParams<{ circleName: string }>(); // Assuming the URL is /c/:circleName
  const hasJoined = useSelector((state: RootState) => state.circle.joinedStatus);
  const navigate = useNavigate();
  const circleExists = useSelector(
    (state: RootState) => state.circle.circleExists
  );
  const user = useSelector((state: RootState) => state.auth.user); // Check if the user is logged in
  const userId = user?.id;
  const posts = useSelector((state: RootState) => state.post.posts); // Fetch posts under this circle
  const circleId = useSelector((state: RootState) => state.circle.circleId);
  const dispatch = useDispatch();
  const [sortedPosts, setSortedPosts] = useState(posts); // Use state to hold sorted posts
  const [reload, setReload] = useState(false); // Add this state

  useEffect(() => {
    dispatch(checkCircleExists(circleName)); // Check if circle exists
  }, [circleName, dispatch]);

  useEffect(() => {
    if (circleExists) {
      dispatch(fetchPostsByCircle(circleName)); // Fetch posts if circle exists
    }
  }, [circleExists, circleName, dispatch]);

  useEffect(() => {
    const newSortedPosts = sortPosts(posts, sortOrder); // Use the sorting function
    setSortedPosts(newSortedPosts);
  }, [posts, sortOrder]);

  useEffect(() => {
    const fetchCircleData = async () => {
      // Fetch the circleId by name first
      const result = await dispatch(fetchCircleIdByName(circleName));
      const circleId = result.payload;

      // Once circleId is fetched, check if user has joined the circle
      if (userId && circleId) {
        dispatch(checkUserJoinedCircle({ userId, circleId }));
      }
    };
    if (circleId && userId) {
      fetchCircleData();
    }
  }, [circleId, userId, dispatch, , reload]);

  const handleJoinCircle = async () => {
    if (!user) return; // Ensure user is logged in
    const result = await dispatch(userJoinCircle({ userId: userId, circleId: circleId}));
    if (result.meta.requestStatus === 'fulfilled') {
      setReload(prev => !prev); // Toggle reload to trigger useEffect
    }
  };

  // Leave circle handler
  const handleLeaveCircle = async () => {
    if (!user) return;
    const result = await dispatch(userLeaveCircle({ userId: userId, circleId: circleId}));
    if (result.meta.requestStatus === 'fulfilled') {
      setReload(prev => !prev); // Toggle reload to trigger useEffect
    }
  }

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

  console.log(sortedPosts)

  return (
    <div className={styles.page}>
      <h1>Welcome to {circleName} Circle!</h1>
      <Link to={`/c/${circleName}/create-post`}>CREATE POST</Link>

      {/* Join/Leave Button - Only show if the user is signed in */}
      {user && (
        <button onClick={hasJoined ? handleLeaveCircle : handleJoinCircle}>
          {hasJoined ? 'Leave Circle' : 'Join Circle'}
        </button>
      )}

      <div className={styles.postsContainer}>
        {sortedPosts.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            title={post.title}
            author={post.author}
            created_at={post.created_at}
            thumbnail={post.thumbnail}
            num_comments={post.num_comments}
            link={post.link}
            circle={post.circle}
            initialVotes={post.initialVotes} // display votes as well
          />
        ))}
      </div>
      <Sidebar />
    </div>
  );};

export default CirclePage;
