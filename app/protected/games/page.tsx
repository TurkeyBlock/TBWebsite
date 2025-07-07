"use client"

import Link from "next/link";
import styles from "./page.module.css";

const Games = () => {
    const board = new Array(9).fill(null);
    return(
        <div className={styles.container}>
        <Link href="./games/tic-tac-toe" className={styles.link}>
            <div className = {styles.board}>
                {/*--------------------*/}
                {board.map((cell, index) => (
                    <div
                    key={index}
                    className={styles.cell}
                    >
                    {cell}
                    </div>
                ))}
            </div>
            Play TicTacToe
        </Link>
        <Link href="./games/connect-four" className={styles.link}>Play Connect-Four</Link>
        </div>


    );
};

export default Games