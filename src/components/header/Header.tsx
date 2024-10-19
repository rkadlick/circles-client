import { Link, useLocation } from "react-router-dom";
import SubMenu from "./SubMenu";
import styles from "./Header.module.css"; // Import the CSS Module
import logo from "../../assets/circlesLogo.png";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useEffect, useState } from "react";
import { fetchUserDetails } from "../../redux/authSlice";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";

interface HeaderProps {
  setSortOrder: (order: string) => void;
}

function Header({ setSortOrder }: HeaderProps) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const username = useSelector((state: RootState) => state.auth.user?.username);
  const location = useLocation();
  const [circleName, setCircleName] = useState(null);

  useEffect(() => {
    const match = location.pathname.match(/^\/c\/([^/]+)(\/|$)/);
    setCircleName(match ? match[1] : null);
  }, [location]);

  const basePath = circleName ? `/c/${circleName}` : "/";

  useEffect(() => {
    if (user) {
      dispatch(fetchUserDetails(user.id));
    }
  }, [user, dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
  };

  return (
    <header className={styles.header}>
      <SubMenu />
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>
        {circleName && (
          <span className={styles.circleTitle}>c/{circleName}</span>
        )}
        <nav className={styles.navLeft}>
          <Link to={basePath} onClick={() => setSortOrder("hot")}>
            Hot
          </Link>
          <Link to={basePath} onClick={() => setSortOrder("new")}>
            New
          </Link>
          <Link to={basePath} onClick={() => setSortOrder("top")}>
            Top
          </Link>
        </nav>
        {user && (
          <div className={styles.navRight}>
            <span>Welcome, {username}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
