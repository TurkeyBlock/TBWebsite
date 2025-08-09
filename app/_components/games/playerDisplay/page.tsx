"use client"

import React from 'react';
import styles from "./page.module.css";

import {upsertSupabaseGamePlayers} from '@/app/_components/games/_supabaseEdgeCaller';

interface Props {
    tableName:string,
    
    playerNames:(string|null)[],
    thisPlayerIndex:number,

    gameId:number,
    gameKey:string,
    currentPlayerIndex:number,
    maxPlayers:number,
    
    hide:boolean
}


export const PlayerDisplay = ({tableName, playerNames=["Error"], thisPlayerIndex=0, gameId, gameKey, currentPlayerIndex, maxPlayers = 2, hide=false}:Props) => {
    const kickPlayer = async (index:number) => {
        console.log("Calling...")
        await upsertSupabaseGamePlayers(tableName, gameId, gameKey, ("KICK "+index));
        console.log("Calling completed.")
    }
    while(playerNames.length < maxPlayers){
        playerNames.push(null);
    }
    return(
        <div className={`color3 ${styles.card}`} style={{display:hide?"none":""}}>
            <p>playerNames length = {playerNames.length}</p>
            <p>current index = {currentPlayerIndex}</p>
            
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
                    <div className={styles.text} style={{
                        backgroundColor: 
                            currentPlayerIndex==index?"green":
                            currentPlayerIndex==-1?"#5b8517ff":
                            "",
                        fontWeight:thisPlayerIndex==index?"bold":""
                        
                    }}>
                        {cell==null?"Waiting for player...":cell}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};