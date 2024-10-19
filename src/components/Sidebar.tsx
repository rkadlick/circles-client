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

  // Fetch the circleId by name
  const fetchCircleId = useCallback(async () => {
    if (circleName) {
      const result = await dispatch(fetchCircleIdByName(circleName));
      return result.payload.id;
    }
    return null;
  }, [dispatch, circleName]);

  // Check if the user has joined the circle
  const checkUserJoined = useCallback(
    async (circleId: string | null) => {
      if (userId && circleId) {
        await dispatch(checkUserJoinedCircle({ userId, circleId }));
      }
    },
    [dispatch, userId]
  );

  // Separate useEffect to handle fetching of circleId and checking user join status
  useEffect(() => {
    const fetchCircleData = async () => {
      const fetchedCircleId = await fetchCircleId();
      await checkUserJoined(fetchedCircleId);
    };

    if (circleName) {
      fetchCircleData();
    }
  }, [circleName, fetchCircleId, checkUserJoined, reload]);

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
                suscipit iaculis mauris? Pharetra rhoncus penatibus eu netus
                risus morbi, aptent aptent.
              </p>
            </>
          )}
        </>
      )}
    </aside>
  );
};

export default Sidebar;
