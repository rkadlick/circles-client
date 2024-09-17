import Post from '../components/Post';

function UserProfile() {
  // Fetch user info and their posts
  const user = { username: 'johndoe', bio: 'Bio here' };
  const userPosts = [
    { id: 1, title: 'User Post 1', content: 'First user post.' },
    { id: 2, title: 'User Post 2', content: 'Second user post.' },
  ];

  return (
    <div>
      <h1>{user.username}</h1>
      <p>{user.bio}</p>

      <h2>User Posts:</h2>
      {userPosts.map((post) => (
        <Post key={post.id} title={post.title} content={post.content} />
      ))}
    </div>
  );
}

export default UserProfile;
