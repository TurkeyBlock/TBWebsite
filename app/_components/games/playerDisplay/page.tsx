import React from 'react';
import styles from "./page.module.css";

import {callSupabase} from '@/app/_components/games/_supabaseEdgeCaller';

interface Props {
    tableName:string,
    playerNames:string[],
    thisPlayerIndex:number,

    gameId:number,
    gameKey:string,
    currentPlayerIndex:number,
    hide:boolean
}


export const PlayerDisplay = ({tableName, playerNames=["Error - improper leave/rejoin"], thisPlayerIndex=0, gameId, gameKey, currentPlayerIndex, hide=false}:Props) => {
    const kickPlayer = async (index:number) => {
        console.log("Calling...")
        await callSupabase("PlayerTracking", tableName, gameId, ("KICK "+index), gameKey);
        console.log("Calling completed.")
    }
    return(
        <div className={`color3 ${styles.card}`} style={{display:hide?"none":""}}>
            playerNames length = {playerNames.length}
            current index = {currentPlayerIndex}
            <div className={`color3`}>
                {playerNames.map((cell, index) => (
                    <div
                    key={index}
                    className={styles.cell}
                    style={{
                        borderBottom:index+1==playerNames.length?"none":"",
                        backgroundColor:index%2==0?"var(--clr-surface-tonal-a20)":"var(--clr-surface-tonal-a40)",
                    }}
                    >
                    <button className={styles.button} onClick={() => kickPlayer(index)}>Kick</button>
                    <div className={styles.text} style={{backgroundColor:currentPlayerIndex==index?"green":""}}>{cell==null?"Waiting for player...":cell}{thisPlayerIndex==index?"*":""}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};