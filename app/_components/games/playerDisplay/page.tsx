import React from 'react';
import styles from "./page.module.css";

import {callSupabase} from '@/app/_components/games/_supabaseEdgeCaller';

interface Props {
    tableName:string,
    playerNames:string[],

    gameId:number,
    gameKey:string,
    hide:boolean
}


export const PlayerDisplay = ({tableName, playerNames=["Error - improper leave/rejoin"], gameId, gameKey, hide=false}:Props) => {
    async function kickPlayer(index:number){
        callSupabase("PlayerTracking", tableName, gameId, ("KICK "+index), gameKey);
    }
    return(
        <main className={`color3 ${styles.card}`}>
            playerNames length = {playerNames.length}
            <div className={`color3`}>
                {playerNames.map((cell, index) => (
                    <div
                    key={index}
                    className={styles.cell}
                    style={{
                        borderBottom:index+1==playerNames.length?"none":"",
                        backgroundColor:index%2==0?"var(--clr-surface-tonal-a20)":"var(--clr-surface-tonal-a40)",
                    }}
                    onClick={() => kickPlayer(index)}
                    >
                        {cell==null?"Waiting for player...":cell}
                    </div>
                ))}
            </div>
        </main>
    );
};