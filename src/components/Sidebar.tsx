import React, { useEffect, useState, useCallback } from "react";
import styles from "./Sidebar.module.css";
import SignUp from "./auth/SignUp";
import SignIn from "./auth/SignIn";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Link, useParams } from "react-router-dom";
import {
  fetchCircleIdByName,
  checkUserJoinedCircle,
  userJoinCircle,
  userLeaveCircle,
} from "../features/circleThunks";

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
      {!user && (
        // Show the auth form if the user is not logged in
        <div className="auth-container">
          {isSignUp ? (
            <SignUp onSwitch={toggleForm} />
          ) : (
            <SignIn onSwitch={toggleForm} />
          )}
        </div>
      )}

      {circleName ? (
        // If circleName is present, always show the circle details
        <>
          <h1 className={styles.title}>{circleName}</h1>
          <p className={styles.description}>{description}</p>

          {user && (
            // Show join/leave and create post buttons only if the user is logged in
            <>
              <button
                className={hasJoined ? styles.leaveButton : styles.joinButton}
                onClick={hasJoined ? handleLeaveCircle : handleJoinCircle}
              >
                {hasJoined ? "Leave Circle" : "Join Circle"}
              </button>
              <Link to={`/c/${circleName}/create-post`}>
                <button className={styles.createPost}>CREATE POST</button>
              </Link>
            </>
          )}
        </>
      ) : (
        // If no circleName, show the create circle option if user is logged in
        user && (
          <>
            <Link to={`/create-circle`}>
              <button className={styles.createCircle}>CREATE CIRCLE</button>
            </Link>
            <p>
              Ad consequat ultricies; ridiculus torquent mus primis. Senectus
              aenean eget pellentesque pretium arcu natoque purus nulla. Nulla
              per primis placerat penatibus ornare auctor non. Turpis inceptos
              magnis rhoncus ridiculus sem nullam. Phasellus fermentum egestas
              at aenean fringilla pulvinar. Torquent commodo natoque dignissim
              suscipit iaculis mauris? Pharetra rhoncus penatibus eu netus risus
              morbi, aptent aptent.
            </p>
          </>
        )
      )}
    </aside>
  );
};

export default Sidebar;
