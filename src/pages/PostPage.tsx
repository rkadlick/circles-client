import Post from '../components/Post';
import Comment from '../components/Comment';

function PostPage() {
  // Get post data and comments (pseudo-fetch)
  const post = { title: 'Post Title', content: 'Post content here' };
  const comments = [
    { id: 1, content: 'First comment' },
    { id: 2, content: 'Second comment' },
  ];

  return (
    <div>
      <Post title={post.title} content={post.content} />
      <div className="comments-section">
        {comments.map((comment) => (
          <Comment key={comment.id} content={comment.content} />
        ))}
      </div>
    </div>
  );
}

export default PostPage;