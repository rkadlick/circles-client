export const sortPosts = (posts: Array<any>, sortOrder: string) => {
	let sortedPosts = [...posts];
  
	if (sortOrder === 'hot') {
	  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
	  sortedPosts = sortedPosts
		.filter(post => post.created_at > twentyFourHoursAgo)
		.sort((a, b) => b.number_of_votes - a.number_of_votes);
	} else if (sortOrder === 'new') {
		sortedPosts.sort((a, b) => {
		  const dateA = new Date(a.created_at); // Convert to Date object
		  const dateB = new Date(b.created_at); // Convert to Date object
		  return dateB.getTime() - dateA.getTime(); // Compare timestamps
		});
	} else if (sortOrder === 'top') {
	  sortedPosts.sort((a, b) => b.number_of_votes - a.number_of_votes);
	}
  
	return sortedPosts;
  };