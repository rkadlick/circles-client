import { Link } from 'react-router-dom';
import SubMenu from './SubMenu';
import styles from './Header.module.css'; // Import the CSS Module
import logo from '../../assets/logo.png'
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useEffect } from 'react';
import { fetchUserDetails } from '../../redux/authSlice';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice'

interface HeaderProps {
  setSortOrder: (order: string) => void;
}

function Header({ setSortOrder }: HeaderProps) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserDetails(user.id));
    }
  }, [user, dispatch]);

  const username = useSelector((state: RootState) => state.auth.user?.username);

  const handleLogout = async () => {
    await dispatch(logout());
  };

  return (
    <header className={styles.header}>
      <SubMenu />
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <img src={logo} alt="Logo" />
        </div>
        <nav className={styles.navLeft}>
          <Link to="/" onClick={() => setSortOrder('hot')}>Hot</Link>
          <Link to="/" onClick={() => setSortOrder('new')}>New</Link>
          <Link to="/" onClick={() => setSortOrder('top')}>Top</Link>
        </nav>
        {user  &&
          <div className={styles.navRight}>
          <span>Welcome, {username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>}
      </div>
    </header>
  );
}

export default Header;
