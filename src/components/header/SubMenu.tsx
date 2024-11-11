import React, { useEffect, useState } from "react";
import styles from "./SubMenu.module.css";
import { RootState } from "@reduxjs/toolkit/query";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserCircles } from "../../features/circleThunks";
import { Link } from "react-router-dom";

const SubMenu: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const circles = useSelector((state: RootState) => state.circle.circles);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && circles.length === 0) {
      // Only fetch circles if they haven't been fetched yet
      dispatch(fetchUserCircles(user.id));
    }
  }, [user, dispatch]);

  const circlesTest = [
    "Arc",
    "Round",
    "Radius",
    "Diameter",
    "Circumference",
    "Center",
    "Loop",
    "Orbit",
    "Sphere",
    "Curve",
    "Spiral",
    "Rotation",
    "Enclose",
    "Loopback",
    "Tangent",
    "Perimeter",
    "Cycle",
    "Ellipse",
    "Ring",
    "Circuit",
    "Sector",
    "Chord",
    "Segment",
    "Concentric",
    "Vortex",
  ];

  return (
    <div className={styles.circleList}>
      <div className={styles.dropdownContainer}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={styles.dropdownButton}
        >
          Circles <span className={styles.arrow}>▼</span>
        </button>
        {showDropdown && (
          <div className={styles.dropdownContent}>
            <ul className={styles.dropdownList}>
              {circles.length > 0 ? (
                circles.map((circle, index) => (
                  <li key={index} className={styles.dropdownItem}>
                    <Link to={`/c/${circle}/`} className={styles.link}>
                      {circle}
                    </Link>
                  </li>
                ))
              ) : (
                <li className={styles.dropdownItem}>
                  Sign in to view joined circles
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      <ul className={styles.list}>
        {circles.map((circle, index) => (
          <li key={index} className={styles.listItem}>
            <Link to={`/c/${circle}/`} className={styles.link}>
              {circle}
            </Link>
            {index < circles.length - 1 && (
              <span className={styles.divider}>-</span>
            )}
          </li>
        ))}
      </ul>
      <button className={styles.dropdownButton}>More...</button>
    </div>
  );
};

export default SubMenu;
