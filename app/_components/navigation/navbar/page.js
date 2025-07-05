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
        <Link href="/protected/games" className={styles.link}>Games</Link>
        <Link href="/auth/login" className={styles.link} style={{position:'absolute', right:'0px', marginRight:"30px"}}>Login</Link>
        
        <Button />
      </div>
  );
};

export default Navbar;

