"use client"

import Link from "next/link";
import styles from "./page.module.css";

//To-do: Timed make-moves w/ respective functions.
const Games = () => {
    const TicTacToe = [null,null,'O',null,'X','O','X',null,null];
    //new Array(9).fill(null);
    const ConnectFour = new Array(7).fill().map(() => Array(6).fill(null));
    return(
        <div className={styles.container}>
            <Link href="./games/tic-tac-toe" className={[styles.link, styles.container].join(" ")}>
                <div className={styles.subContainer}>
                    <div className = {styles.TicTacToe}>
                        {/*--------------------*/}
                        {TicTacToe.map((cell, index) => (
                            <div
                            key={index}
                            className={styles.cell}
                            >
                            {cell}
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.subContainer}>
                    Play TicTacToe
                </div>
            </Link>
            <Link href="./games/connect-four" className={[styles.link, styles.container].join(" ")}>
                <div className = {styles.subContainer}>
                    <div className = {styles.ConnectFour}>
                        {ConnectFour.map((col, colIndex) => (
                            <div
                                key={colIndex}
                                className = {styles.column}
                            >
                            {col.map((slot, slotIndex) => (
                                <div
                                    key={slotIndex}
                                    className = {ConnectFour[colIndex][slotIndex] == null ? styles.slot
                                    : (ConnectFour[colIndex][cellIndex] == 'X') ? [styles.slot, styles.tokenA].join(" ")
                                    : [styles.slot, styles.tokenB].join(" ")}
                                >
                                {slot}
                                </div>
                            ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className = {styles.subContainer}>
                    Play Connect-Four
                </div>
            </Link>
        </div>


    );
};

export default Games