function Comment({ content }) {
	return (
	  <div className="comment">
		<p>{content}</p>
		{/* Upvote/Downvote functionality */}
	  </div>
	);
  }
  
  export default Comment;