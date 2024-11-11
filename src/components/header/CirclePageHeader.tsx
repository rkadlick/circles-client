import { RootState } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import styles from './CirclePageHeader.module.css'
import { userJoinCircle, userLeaveCircle } from '../../features/circleThunks';
import { useState } from 'react';





const CirclePageHeader: React.FC = () => {

	const user = useSelector((state: RootState) => state.auth.user);
	const { circleName } = useParams<{ circleName: string }>();
	const circleId = useSelector((state: RootState) => state.circle.circleId);
	const description = useSelector(
	  (state: RootState) => state.circle.description
	);
	const dispatch = useDispatch();
	const [reload, setReload] = useState(false);
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



	return(
		<div className={styles.header}>
			<h1 className={styles.circleTitle}>{circleName}</h1>
			{user && (
              <button
			  className={hasJoined ? styles.leaveButton : styles.joinButton}
			  onClick={hasJoined ? handleLeaveCircle : handleJoinCircle}
			>
			  {hasJoined ? "Leave Circle" : "Join Circle"}
			</button>
			)}
			<p className={styles.circleDescription}>{description}</p>
			{user && (
            // Show join/leave and create post buttons only if the user is logged in
              <Link to={`/c/${circleName}/create-post`}>
                <button className={styles.createPost}>CREATE POST</button>
              </Link>
          )}
		</div>
	)
}

export default CirclePageHeader;