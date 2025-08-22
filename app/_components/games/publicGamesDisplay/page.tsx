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

    const offsetMult = 10;
    const [offsetCount, setOffsetCount] = useState(0);
    const [publicGames, setPublicGames] = useState<Array<publicGame>>([]);

    //Increase/Decrease what 'page' of public lobbies the client is querrying
    function incOffset(){
        if(publicGames.length >= 10){
            setOffsetCount(offsetCount+1);
        }
    }
    function decOffset(){
        if(offsetCount > 0 ){
            setOffsetCount(offsetCount-1);
        }
    }

    
    useEffect(() => {
        async function getPublicGames(){
            const { data } = await createClient().from(tableName).select('name, id').range(offsetCount*offsetMult,(offsetCount+1)*offsetMult).eq('public', true);
            if(data!=null)
                setPublicGames(data);
            return data;
        }
        if (tableName==null) {
            return;
        }
        getPublicGames();
    },[tableName,offsetCount])
    
    return(
        <div className = {styles.publicGames}>
            <div className={styles.publicName}style={{flexDirection:'row', alignContent:'center'}}>
                <div style={{paddingBottom:'5px', alignContent:'center'}}>
                    Public Lobbies
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