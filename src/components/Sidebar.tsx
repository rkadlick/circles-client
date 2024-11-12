import React, { useEffect, useState, useCallback } from "react";
import styles from "./Sidebar.module.css";
import SignUp from "./auth/SignUp";
import SignIn from "./auth/SignIn";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Link, useParams } from "react-router-dom";
import { userJoinCircle, userLeaveCircle } from "../features/circleThunks";

const Sidebar: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  const [isSignUp, setIsSignUp] = useState(true);
  const { circleName } = useParams<{ circleName: string }>();
  const circleId = useSelector((state: RootState) => state.circle.circleId);
  const description = useSelector(
    (state: RootState) => state.circle.description
  );
  const toggleForm = () => setIsSignUp((prev) => !prev);
  const dispatch = useDispatch();
  const [reload, setReload] = useState(false);
  // Selector to get the user's joined circles
  const joinedCircles = useSelector((state: RootState) => state.circle.circles);
  // Check if the user is a member of the current circle
  const hasJoined = circleName && joinedCircles.includes(circleName);

  // Join circle handler
  const handleJoinCircle = async () => {
    if (!user) return; // Ensure user is logged in
    const result = await dispatch(
      userJoinCircle({ userId: userId, circleId: circleId })
    );
    if (result.meta.requestStatus === "fulfilled") {
      setReload((prev) => !prev); // Toggle reload to trigger useEffect
    }
  };

  // Leave circle handler
  const handleLeaveCircle = async () => {
    if (!user) return;
    const result = await dispatch(
      userLeaveCircle({ userId: userId, circleId: circleId })
    );
    if (result.meta.requestStatus === "fulfilled") {
      setReload((prev) => !prev); // Toggle reload to trigger useEffect
    }
  };

  return (
    <aside className={styles.sidebar}>
      {!user ? (
        <div className="auth-container">
          {isSignUp ? (
            <SignUp onSwitch={toggleForm} />
          ) : (
            <SignIn onSwitch={toggleForm} />
          )}
        </div>
      ) : (
        <Link to={`/create-circle`}>
        <button className={styles.createCircle}>CREATE NEW CIRCLE</button>
      </Link>
      )}
      <div className={styles.projectDescription}>
        <p>
          This project is a sophisticated forum-based platform, similar in
          structure to popular sites like Reddit, but developed purely as a
          learning and portfolio project to demonstrate expertise in modern web
          development. The site features fully functional user authentication,
          allowing users to sign up, log in, and interact with posts within
          various interest-based circles (akin to subreddits). Users can create
          new circles, make posts, vote on content, and leave comments. The site
          is responsive and optimized for both desktop and mobile devices,
          ensuring a seamless user experience.
        </p>
        <p>
          A major highlight of the project is its robust handling of state
          management using Redux Toolkit, with data fetched and stored
          efficiently through Supabase as the backend database. The front end is
          developed with React, TypeScript, and Vite, emphasizing speed and
          scalability. Key features include dynamic routing for posts and
          circles, conditional rendering based on user authentication status,
          and real-time data synchronization for voting and commenting. The
          architecture of the project required a strong understanding of API
          integration, database design, and asynchronous actions, along with a
          focus on performance optimization to minimize unnecessary re-renders
          and API calls.
        </p>
        <p>
          It's important to note that while the project is fully functional and
          showcases skills in full-stack development, it is not intended as a
          live alternative to existing forum platforms. The focus here is purely
          on demonstrating technical skills and problem-solving abilities. Due
          to this, account creation is restricted, and potential users who wish
          to explore the full functionality of the site must contact me to
          receive a testing code to sign up. This measure ensures controlled
          access while also allowing interested parties to see the capabilities
          of the project firsthand.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
