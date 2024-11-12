import { useDispatch, useSelector } from "react-redux";
import Post from "../components/posts/Post";
import styles from "./UserProfile.module.css";
import { RootState } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { fetchUserPosts } from "../features/postThunks";

function UserProfile() {
  const user = useSelector((state: RootState) => state.auth.user);
  const username = useSelector((state: RootState) => state.auth.user?.username);
  const posts = useSelector((state: RootState) => state.posts.posts); // Fetch posts under this circle
  const dispatch = useDispatch();
  //const [sortedPosts, setSortedPosts] = useState(posts);
  // const [sortedPosts, setSortedPosts] = useState(''); // Use state to hold sorted posts

  useEffect(() => {
    if (user && user.id) {  // Check if user is loaded
      dispatch(fetchUserPosts(user));  
    }
  }, [dispatch, user]);

  return (
    <div className={styles.userProfile}>
      <div className={styles.postsContainer}>
        {posts.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            title={post.title}
            author={post.users.username}
            created_at={post.created_at}
            thumbnail={post.thumbnail}
            number_of_comments={post.number_of_comments}
            link={post.link}
            number_of_votes={post.number_of_votes} // display votes as well
            circle={post.circles?.name}
            home_page={true}
            voteType={post.user_vote}
          />
        ))}
      </div>
    </div>
  );
}

export default UserProfile;
