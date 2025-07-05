"use client"

import Link from "next/link";
import styles from "./page.module.css";

const Games = () => {
    return(
        <div className={styles.container}>
            <Link href="./games/tic-tac-toe" className={styles.link}>Tic-Tac-Toe</Link>
            <Link href="./games/connect-four" className={styles.link}>Connect-Four</Link>
        </div>


    );
};

export default Games