"use client"

import {useState, useEffect} from "react";
import Link from "next/link";
import styles from "./page.module.css";

//To-do: Timed make-moves w/ respective functions.
const Games = () => {
    const TicTacToe = [null,null,'O',null,'X','O','X',null,null];
    //new Array(9).fill(null);
    const ConnectFour = new Array(7).fill(null).map(() => Array(6).fill(null));

    const [isHeightGreater, setIsHeightGreater] = useState(false);

    useEffect(() => {
        const checkDimensions = () => {
            setIsHeightGreater(window.innerHeight > window.innerWidth);
        };

        // Initial check
        checkDimensions();

        // Add event listener for window resize
        window.addEventListener('resize', checkDimensions);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', checkDimensions);
        };
    }, []);

    return(
        <main className={styles.background}>
            <div className={styles.container}  style={{flexDirection: isHeightGreater?'column':'row'}}>
                <Link href="./games/tic-tac-toe" className={[styles.link, styles.subContainer].join(" ")}>
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
                <Link href="./games/connect-four" className={[styles.link, styles.subContainer].join(" ")}>
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
                                        : (ConnectFour[colIndex][slotIndex] == 'X') ? [styles.slot, styles.tokenA].join(" ")
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
        </main>
    );
};

export default Games