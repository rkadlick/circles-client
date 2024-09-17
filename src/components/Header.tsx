import { Link } from 'react-router-dom';
import SubMenu from './SubMenu';
import styles from './Header.module.css'; // Import the CSS Module
import logo from '../assets/logo.png'

interface HeaderProps {
  setSortOrder: (order: string) => void;
}

function Header({ setSortOrder }: HeaderProps) {
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
        <div className={styles.navRight}>
          <Link to="/profile">Profile</Link>
          <Link to="/logout">Logout</Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
