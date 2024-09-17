import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import PostPage from './pages/PostPage';
import UserProfile from './pages/UserProfile';
import styles from './App.module.css';
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from 'react';


function App() {
  const [sortOrder, setSortOrder] = useState<string>('hot'); // Default sort order

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
