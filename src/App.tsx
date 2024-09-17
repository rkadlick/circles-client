import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header/Header';
import Home from './pages/Home';
import PostPage from './pages/PostPage';
import UserProfile from './pages/UserProfile';
import { useState } from 'react';


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
