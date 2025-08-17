"use client"

import Link from "next/link";
import styles from "./page.module.css";

//To-do: Timed make-moves w/ respective functions.
const Games = () => {
    const TicTacToe = [null,null,'O',null,'X','O','X',null,null];
    //new Array(9).fill(null);
    const ConnectFour = new Array(7).fill(null).map(() => Array(6).fill(null));
    return(
        <main className = "main">
            <div className={`color3 ${styles.container}`}>
                <Link href={{pathname: "./games/online", query:{game: "TicTacToe"}}} className={`${styles.link} ${styles.subContainer}`}>
                    <div className={styles.subContainer} >
                        <div className = {styles.TicTacToe}>
                            {/*--------------------*/}
                            {TicTacToe.map((cell, index) => (
                                <div
                                key={index}
                                className={`color0 ${styles.cell}`}
                                >
                                {cell}
                                </div>
                            ))}
                        </div>
                    </div>
                    Play TicTacToe
                </Link>
                <Link href={{pathname: "./games/online", query:{data: "ConnectFour"}}} className={`${styles.link} ${styles.subContainer}`}>
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
                                        className = {`color0 ${ConnectFour[colIndex][slotIndex] == null ? styles.slot
                                        : (ConnectFour[colIndex][slotIndex] == 'X') ? [styles.slot, styles.tokenA].join(" ")
                                        : [styles.slot, styles.tokenB].join(" ")}`}
                                    >
                                    {slot}
                                    </div>
                                ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    Play Connect-Four
                </Link>
            </div>
        </main>
    );
};

export default Games