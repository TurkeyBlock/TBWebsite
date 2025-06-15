import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import Button from "./Button";
import styles from "./page.module.css";

const Navbar = () => {
  return (
      <div className={styles.body}>
        <Logo />
        <Link href="/" className={styles.link}>Homepage</Link>
        <Link href="/protected/games/tic-tac-toe" className={styles.link}>Games</Link>
        <Button />
      </div>
  );
};

export default Navbar;

