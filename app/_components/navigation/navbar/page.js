import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import Button from "./Button";
import styles from "./page.module.css";

const Navbar = () => {
  return (
      <div className={`color0 ${styles.body}`}>
        <Logo />
        <Link href="/" className={`color0 ${styles.link}`}>Homepage</Link>
        <Link href="/protected/games" className={`color0 ${styles.link}`}>Games</Link>
        <Link href="/auth/login" className={`color0 ${styles.link}`}>Login</Link>
        
        <Button />
      </div>
  );
};

export default Navbar;

