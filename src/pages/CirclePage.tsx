import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../auth/supabaseClient"; // Assuming you have Supabase setup
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store"; // Ensure correct store import
import Post from "../components/posts/Post";
import { checkCircleExists } from "../features/circleSlice";
import styles from "./CirclePage.module.css";
import { fetchPostsByCircle } from "../features/postSlice";
import Sidebar from "../components/Sidebar";
import { sortPosts } from "../utils/sortPosts";


interface CirclePageProps {
  sortOrder: string;
}

const CirclePage: React.FC<CirclePageProps> = ({ sortOrder }) => {
  const { circleName } = useParams<{ circleName: string }>(); // Assuming the URL is /c/:circleName
  const [isMember, setIsMember] = useState(false); // Track membership status
  const navigate = useNavigate();
  const circleExists = useSelector(
    (state: RootState) => state.circle.circleExists
  );
  const user = useSelector((state: RootState) => state.auth.user); // Check if the user is logged in
  const posts = useSelector((state: RootState) => state.post.posts); // Fetch posts under this circle
  const circleId = useSelector((state: RootState) => state.circle.circleId);
  const dispatch = useDispatch();
  const [sortedPosts, setSortedPosts] = useState(posts); // Use state to hold sorted posts

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
    const checkMembership = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user_circles')
          .select('*')
          .eq('user_id', user.id)
          .eq('circle_id', circleId); // Assuming circleName is the ID

        if (error) {
          console.error(error.message);
        } else if (data.length > 0) {
          setIsMember(true); // User is a member
        }
      }
    };

    checkMembership();
  }, [user, circleName]);

  const handleJoinCircle = async () => {
    if (!user) return; // Ensure user is logged in

    const { error } = await supabase
      .from('user_circles')
      .insert([{ user_id: user.id, circle_id: circleId }]); // Insert the join row

    if (error) {
      console.error(error.message);
    } else {
      setIsMember(true); // Update state to reflect new membership
    }
  };

  // Leave circle handler
  const handleLeaveCircle = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_circles')
      .delete()
      .eq('user_id', user.id)
      .eq('circle_id', circleId); // Remove the join row

    if (error) {
      console.error(error.message);
    } else {
      setIsMember(false); // Update state to reflect left circle
    }
  };

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
      <h1>Welcome to {circleName} Circle!</h1>
      <Link to={`/c/${circleName}/create-post`}>CREATE POST</Link>

      {/* Join/Leave Button - Only show if the user is signed in */}
      {user && (
        <button onClick={isMember ? handleLeaveCircle : handleJoinCircle}>
          {isMember ? 'Leave Circle' : 'Join Circle'}
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
            permalink={post.permalink}
            initialVotes={post.initialVotes} // display votes as well
          />
        ))}
      </div>
      <Sidebar />
    </div>
  );};

export default CirclePage;
