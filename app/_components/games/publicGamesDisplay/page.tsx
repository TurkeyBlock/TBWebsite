"use client"

import styles from "./page.module.css";

import {useState, useEffect} from "react";
import { createClient } from '@/lib/supabase/client';

interface pbProp{
    tableName:string
}
interface publicGame{
    name:string,
    id:string
}

export default function PublicGamesDisplay({tableName}:pbProp){

    const [loadingPublicGames, setLoadingPublicGames] = useState(false);
    const offsetMult = 10;
    const [offsetCount, setOffsetCount] = useState(0);
    const [publicGames, setPublicGames] = useState<Array<publicGame>>([]);

    //Increase/Decrease what 'page' of public lobbies the client is querrying
    function incOffset(){
        if(publicGames.length >= 10){
            setOffsetCount(offsetCount+1);
            getPublicGames()
        }
    }
    function decOffset(){
        if(offsetCount > 0 ){
            setOffsetCount(offsetCount-1);
            getPublicGames()
        }
    }

    async function getPublicGames(){
        if(loadingPublicGames){
            return null;
        }
        setLoadingPublicGames(true);
        const { data } = await createClient().from(tableName).select('name, id').range(offsetCount*offsetMult,(offsetCount+1)*offsetMult).eq('public', true);
        setLoadingPublicGames(false);
        if(data!=null)
            setPublicGames(data);
        return data;
    }

    useEffect(() => {
        if (tableName==null) {
            return;
        }
        getPublicGames();
    },[tableName])
    
    return(
        <div className = {styles.publicGames}>
            <div style={{paddingBottom:'5px'}}>
                <button 
                    type='button'
                    className = {`${styles.submitButton} 
                        ${loadingPublicGames ? styles.loadingCursor
                        : '' }`
                    }
                    onClick = {getPublicGames}
                >
                    🗘
                </button>
                <div style = {{display:'inline-block', marginLeft:'10px'}}>
                    Public Lobbies
                </div>
            </div>
            
            <div className={styles.cellBlock}>
                
                {publicGames.length > 0 ? publicGames.map((cell, index) => (
                    <div
                        key = {index}
                        className = {styles.cell}
                        style={{
                            borderBottom:index+1==publicGames.length?"none":"",
                            backgroundColor:index%2==0?"var(--clr-surface-tonal-a20)":"var(--clr-surface-tonal-a40)",
                        }}
                    >
                        {cell.name} | ID: {cell.id}
                    </div>
                )):
                <div className = {styles.cell}>
                    Empty
                </div>
                
                }
            </div>
            <div>
                <button
                    type="button"
                    className={styles.submitButton}
                    onClick = {decOffset}
                    >
                    {"<<"}
                </button>
                &nbsp;Page {offsetCount+1}&nbsp;
                <button
                    type="button"
                    className={styles.submitButton}
                    onClick = {incOffset}
                    >
                    {">>"}
                </button>
            </div>
        </div>
    )
}