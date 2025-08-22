"use client"

import {useState, useEffect, Dispatch, SetStateAction} from 'react';
import {upsertSupabaseGame} from '@/app/_components/games/_supabaseEdgeCaller';
import PublicGamesDisplay from '@/app/_components/games/publicGamesDisplay/page';

import styles from "./page.module.css";

interface Props {
    tableName:string
    setGameId:Dispatch<SetStateAction<string|null>>
    setGameKey:Dispatch<SetStateAction<string>>
    inLobby:boolean,
}

export const Sidebar = ({tableName, setGameId, setGameKey, inLobby}:Props) => {

    const [inputGameId, setInputGameId] = useState("");  //Form input for lobby id.
    const [inputGameKey, setInputGameKey] = useState("");  //Form input for lobby key.
    const [chosenGameKey, setChosenGameKey] = useState(""); //Form input for key creation for a new game

    const [sidebar, setSidebar] = useState(true);
    function toggleSidebar(){
        setSidebar(sidebar?false:true);
    }
    const [sidebarWidth, setSidebarWidth] = useState(0);
    useEffect(() => {
        // Function to update the window width
        const handleResize = () => {
            const value = document.getElementById("contents")!.offsetWidth
            setSidebarWidth(value);
        };

        // Add event listener on component mount
        window.addEventListener("resize", handleResize);

        // Call the handler initially to set the initial width
        handleResize();
        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    function handleJoin(event:any){
        event.preventDefault(); //Do not refresh the page
        if(inLobby){ //Leave lobby
            console.log("Sidebar: leaving lobby");
            setGameId(null);
            setGameKey("");
            setChosenGameKey('');
            setInputGameId('');
            setInputGameKey('');

            return;
        }
        setGameId(inputGameId);
        setGameKey(inputGameKey);
    }

    async function submitGameCreate(){
        if(!inLobby){
            const payload = await upsertSupabaseGame("POST", tableName, null, chosenGameKey, null);
            console.log(payload);
            if(payload.error == null){
                setGameId(payload.id!.toString());
                setGameKey(payload.key);

                //For visual sidebar purposes
                setInputGameId(payload.id!.toString());
                setInputGameKey(payload.key);
            }
        }
    }

    function handleCreate(event:any){
        event.preventDefault(); //Do not refresh the page
        submitGameCreate();
    }

    return (
        <div className={styles.sidebar}>
            {/* sidebar flexbox*/}
            <div id="contents" className={`color4 ${styles.sidebarContents}`} style={{marginLeft: sidebar?``:-`${sidebarWidth}`, maxHeight: sidebar?`100%`:`0`, transition:("margin-left .5s ease 0s, max-height 0s ease ").concat(sidebar?"0s":".5s")}}>
                {  /*<TextInput boxLabel="Lobby Code:" inputText={inputText} buttonLabel="Submit" setInputText={setInputText} handleSubmit={ handleSubmit }/>*/}

                {/*Game ID / Key submission form*/}
                <form className = {`${styles.form}`} onSubmit={handleJoin}>
                    <div className={styles.displayGrouping}>
                        <label htmlFor="textInput" className={styles.label}>
                            Game ID
                        </label>
                        <input
                            type="text"
                            id="gameIdInput"
                            placeholder="Required"
                            value={inputGameId}
                            onChange={!inLobby?((event) => {setInputGameId(event.target.value)}):()=>{}}
                            style={{
                            marginLeft:'auto',
                            padding: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            }}
                        />
                    </div>
                    <div className={styles.displayGrouping} style={{marginTop:'3px'}}>
                        <label htmlFor="textInput" className={styles.label}>
                            Game Key
                        </label>
                        <input
                            type="text"
                            id="gameKeyInput"
                            placeholder="Optional"
                            value={inputGameKey}
                            onChange={!inLobby?((event) => {setInputGameKey(event.target.value)}):()=>{}}
                            style={{
                                marginLeft:'auto',
                                padding: '5px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        />
                    </div>
                    <button
                    type="submit"
                    className = {styles.submitButton}
                    >
                    {inLobby ? 'Leave Game' : 'Join Game' }
                    </button>
                </form>

                <span className={`color2 ${styles.line}`} style={{display:inLobby?'none':''}}></span>

                <form className = {`${styles.form}`} style={{display:inLobby?'none':''}} onSubmit={handleCreate}>
                    <div className={styles.displayGrouping}>
                        <label htmlFor="textInput" className={styles.label}>
                            Game Key
                        </label>
                        <input
                            type="text"
                            placeholder="Optional"
                            id="gameKeyInput"
                            value={chosenGameKey}
                            onChange={(event) => { setChosenGameKey(event.target.value) }}
                            style={{
                                marginLeft:'auto',
                                padding: '5px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        />
                    </div>
                    <button
                    type="submit"
                    className={styles.submitButton}
                    >
                    Create Game
                    </button>
                </form>

                <span className={`color2 ${styles.line}`}></span>
                
                {/* Width = 0, minWidth = 100%  (or contain:"size") ensures that this box does not contribute to the size of the sidebar, and instead matches what is forced by the other children. */}
                <div className='secondBox' style={{display:'flex', flexDirection:'column', padding:"5%", width:"0", minWidth:"100%",overflow:'hidden'}}>
                    <div style={{fontWeight:'bold'}}>Joining a game:</div>
                    <span>Enter the Game ID, and the Game Key if it requires one, then click [Join Game].</span>
                    <span style={{'paddingTop':'10px'}}>If you do not have a required Game Key, or if the lobby is full, you will join in spectate-only. </span>
                    <div  style={{marginTop:'15px', fontWeight:'bold'}}>Creating a game:</div>
                    <span>Enter a Game Key of your choosing, which you will share with others, then click [Create Game]. If no Game Key is entered, the game will be open to all.</span>
                </div>
                <span className={`color2 ${styles.line}`}></span>
                <PublicGamesDisplay tableName = {tableName}/>
            </div>
            <span className='color5'>
            <button className={styles.sidebarButton} onClick={toggleSidebar}>{sidebar==true?"<<":">>"}</button>
            </span>
        </div>
    );
};