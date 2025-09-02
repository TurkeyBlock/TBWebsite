//Game selection menu
"use client"

import Link from "next/link";
import styles from "./page.module.css";

//To-do: Timed make-moves w/ respective functions.
const Games = () => {
    const TicTacToe = [null,null,'O',null,'X','O','X',null,null];
    //new Array(9).fill(null);
    const ConnectFour = new Array(7).fill(null).map(() => Array(6).fill(null));
    ConnectFour[3][5]='X'; ConnectFour[4][4]='X'; ConnectFour[4][3]='X'; ConnectFour[3][3]='X'; ConnectFour[2][4]='X'; 
    ConnectFour[4][5]='O'; ConnectFour[3][4]='O'; ConnectFour[2][5]='O'; ConnectFour[5][5]='O'; ConnectFour[4][2]='O'; 
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
                <Link href={{pathname: "./games/online", query:{game: "ConnectFour"}}} className={`${styles.link} ${styles.subContainer}`}>
                    <div className = {styles.subContainer}>
                        <div className = {styles.ConnectFour}>
                            {ConnectFour.map((col, colIndex) => (
                                <div
                                    key={colIndex}
                                    className = {`${styles.column} color0`}
                                    style = {{
                                        borderLeft:`${colIndex == 0 ? '2px solid':''}`,
                                        borderRight:`${colIndex == ConnectFour.length-1 ? '2px solid':''}`
                                    }}
                                >
                                {col.map((slot, slotIndex) => (
                                    <div
                                        key={slotIndex}
                                        className = {` ${ConnectFour[colIndex][slotIndex] == null ? styles.slot
                                        : (ConnectFour[colIndex][slotIndex] == 'X') ? [styles.slot, styles.tokenA].join(" ")
                                        : [styles.slot, styles.tokenB].join(" ")}`}
                                    >
                                        
                                    </div>
                                ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    Play Connect-Four
                </Link>
                <Link href={{pathname: "./games/online", query:{game: "Checkers"}}} className={`${styles.link} ${styles.subContainer}`}>
                    Play Checkers
                </Link>
                <div>~~~~~~~~~~~~
            </div>
        </main>
    );
};

export default Games