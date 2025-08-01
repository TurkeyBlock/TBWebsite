import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import Button from "./Button";
import styles from "./page.module.css";
import "@/app/globals.css";

const Navbar = () => {
  return (
      <div className={`header ${styles.body}`}>
        <Logo />
        <Link href="/" className={`header ${styles.link}`}>Homepage</Link>
        <Link href="/protected/games" className={`header ${styles.link}`}>Games</Link>
        <Link href="/auth/login" className={`header ${styles.link}`}>Login</Link>
        
        <Button />
      </div>
  );
};

export default Navbar;

