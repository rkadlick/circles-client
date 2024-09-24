// Sidebar.tsx
import React, { useEffect, useState } from "react";
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
} from "../features/circleSlice";

const Sidebar: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  const [isSignUp, setIsSignUp] = useState(true);
  const { circleName } = useParams<{ circleName: string }>();
  const circleId = useSelector((state: RootState) => state.circle.circleId);
  const description = useSelector(
    (state: RootState) => state.circle.description
  );
  const hasJoined = useSelector(
    (state: RootState) => state.circle.joinedStatus
  );
  const toggleForm = () => setIsSignUp((prev) => !prev);
  const dispatch = useDispatch();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const fetchCircleData = async () => {
      // Fetch the circleId by name first
      const result = await dispatch(fetchCircleIdByName(circleName));
      const circleId = result.payload.id;

      // Once circleId is fetched, check if user has joined the circle
      if (userId && circleId) {
        dispatch(checkUserJoinedCircle({ userId, circleId }));
      }
    };
    if (circleId && userId) {
      fetchCircleData();
    }
  }, [circleId, userId, dispatch, reload]);

  const handleJoinCircle = async () => {
    if (!user) return; // Ensure user is logged in
    console.log(circleId);
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

  console.log(circleName);

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
        <>
          {circleName ? (
            <>
              <h1 className={styles.title}>{circleName}</h1>
              <button
                className={hasJoined ? styles.leaveButton : styles.joinButton}
                onClick={hasJoined ? handleLeaveCircle : handleJoinCircle}
              >
                {hasJoined ? "Leave Circle" : "Join Circle"}
              </button>
              <p className={styles.description}>{description}</p>
          <Link to={`/c/${circleName}/create-post`}>
            <button className={styles.createPost}>CREATE POST</button>
          </Link>
          </>
          ) : (
            <p>Ad consequat ultricies; ridiculus torquent mus primis. Senectus aenean eget pellentesque pretium arcu natoque purus nulla. Nulla per primis placerat penatibus ornare auctor non. Turpis inceptos magnis rhoncus ridiculus sem nullam. Phasellus fermentum egestas at aenean fringilla pulvinar. Torquent commodo natoque dignissim suscipit iaculis mauris? Pharetra rhoncus penatibus eu netus risus morbi, aptent aptent.</p>
          )}
        </>
      )}
    </aside>
  );
};

export default Sidebar;
