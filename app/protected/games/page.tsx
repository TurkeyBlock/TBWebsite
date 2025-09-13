//Game selection menu
"use client"

import Link from "next/link";
import styles from "./page.module.css";


//To-do: Timed make-moves w/ respective functions.
const Games = () => {
    
    //const [slotColor, setSlotColor] = useState('');

    const TicTacToe = [null,null,'O',null,'X','O','X',null,null];
    //new Array(9).fill(null);
    const ConnectFour = new Array(7).fill(null).map(() => Array(6).fill(null));
    ConnectFour[3][5]='X'; ConnectFour[4][4]='X'; ConnectFour[4][3]='X'; ConnectFour[3][3]='X'; ConnectFour[2][4]='X'; 
    ConnectFour[4][5]='O'; ConnectFour[3][4]='O'; ConnectFour[2][5]='O'; ConnectFour[5][5]='O'; ConnectFour[4][2]='O'; 
    
    return(
        <>
            <div className = {`${styles.title}`}>
                Game Selection
            </div>
            <div className={`${styles.container}`}>
                <div className={`${styles.rowContainer}`}>
                    <Link href={{pathname: "./games/online", query:{game: "TicTacToe"}}} className={`${styles.link} ${styles.subContainer} color5`}>
                        <div className={styles.subContainer} >
                            <div className = {styles.TicTacToe}>
                                {/*--------------------*/}
                                {TicTacToe.map((cell, index) => (
                                    <div
                                    key={index}
                                    style = {{color:
                                    `${TicTacToe[index] == 'X' ? "#FFC20A"
                                    : TicTacToe[index] == 'O' ? "#0C7BDC"
                                    : ''}`
                                    }}
                                    className={`color0 ${styles.cell}`}
                                    >
                                    {cell}
                                    </div>
                                ))}
                            </div>
                        </div>
                        Play TicTacToe
                    </Link>
                    <Link href={{pathname: "./games/online", query:{game: "ConnectFour"}}} 
                        className={`${styles.link} ${styles.subContainer} color5`}
                        //onMouseEnter={() => setSlotColor("rgb(14, 135, 14)")}
                        //onMouseLeave={() => setSlotColor("")}
                    >
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
                                            //style = {{backgroundColor:`${ConnectFour[colIndex][slotIndex] == null ? slotColor : ""}`}}
                                            key={slotIndex}
                                            className = {`${styles.slot} 
                                            ${ ConnectFour[colIndex][slotIndex] == 'X' ? styles.tokenA
                                            : ConnectFour[colIndex][slotIndex] == 'O' ? styles.tokenB
                                            : "" }
                                            `}
                                        >
                                            
                                        </div>
                                    ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                        Play Connect-Four
                    </Link>
                </div>
                <div className={`${styles.rowContainer}`}>
                    <Link href={{pathname: "./games/online", query:{game: "Checkers"}}} className={`${styles.link} ${styles.subContainer} color5`}>
                        Play Checkers
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Games