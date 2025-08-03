import React from 'react';
import styles from "./page.module.css";

import {callSupabase} from '@/app/_components/games/_supabaseEdgeCaller';

interface Props {
    tableName:string,
    playerNames:string[],

    gameId:number,
    gameKey:string
}


export const PlayerDisplay = ({tableName, playerNames=["Error - improper leave/rejoin"], gameId, gameKey}:Props) => {
    async function kickPlayer(index:number){
        callSupabase("PlayerTracking", tableName, gameId, ("KICK "+index), gameKey);
    }
    return(
        <main style={{width:"400px"}}>
            playerNames length = {playerNames.length}
            {playerNames.map((cell, index) => (
                <div
                key={index}
                className={styles.cell}
                onClick={() => kickPlayer(index)}
                >
                    {cell==null?"Waiting for player...":cell}
                </div>
            ))}
        </main>
    );
};