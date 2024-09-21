import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header/Header';
import Home from './pages/Home';
import PostPage from './pages/PostPage';
import UserProfile from './pages/UserProfile';
import CreateCircle from './pages/CreateCircle';
import { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from './auth/supabaseClient';
import { fetchUserDetails, fetchCurrentUser } from './redux/authSlice';
import { RootState } from './redux/store';
import CirclePage from './pages/CirclePage';
import CreatePost from './pages/CreatePost';


function App() {
  const dispatch = useDispatch();
  const [sortOrder, setSortOrder] = useState<string>('hot'); // Default sort order

  useEffect(() => {
    const fetchSession = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
        return;
      }

      const session = sessionData?.session;
      if (session) {
        dispatch(fetchCurrentUser());
      }
    };

    fetchSession();
  }, [dispatch]);

  return (
    <Router>
      <Header setSortOrder={setSortOrder} />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home sortOrder={sortOrder} />} />
          <Route path="/create-circle" element={<CreateCircle />} />
          <Route path="/c/:circleName" element={<CirclePage sortOrder={sortOrder} />} />
          <Route path="/c/:circleName/create-post" element={<CreatePost />} />
          <Route path="c/:circleName/post/:postId" element={<PostPage />} />
          <Route path="/user/:username" element={<UserProfile />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
