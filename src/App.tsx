import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header/Header';
import Home from './pages/Home';
import PostPage from './pages/PostPage';
import UserProfile from './pages/UserProfile';
import { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from './auth/supabaseClient';
import { fetchUserDetails, fetchCurrentUser } from './redux/authSlice';
import { RootState } from './redux/store';


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
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/user/:username" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
