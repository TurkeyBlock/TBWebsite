"use client"

import {useState, Dispatch, SetStateAction } from "react";
import {callSupabase} from '@/app/_components/games/_supabaseEdgeCaller';

interface Props {
    tableName:string
    setGameId:Dispatch<SetStateAction<string|null>>
    setGameKey:Dispatch<SetStateAction<string>>
    setInLobby:Dispatch<SetStateAction<boolean>>
    inLobby:boolean,
}
interface PostReturn {
  id:number
  key:string
}
export const Sidebar = ({tableName, setGameId, setGameKey, setInLobby, inLobby}:Props) => {

    const [inputGameId, setInputGameId] = useState("");  //Form input for lobby id.
    const [inputGameKey, setInputGameKey] = useState("");  //Form input for lobby key.
    const [chosenGameKey, setChosenGameKey] = useState(""); //Form input for key creation for a new game

    const [sidebar, setSidebar] = useState(true);
    function toggleSidebar(){
        setSidebar(sidebar?false:true);
    }

    function handleJoin(event:any){
        event.preventDefault(); //Do not refresh the page
        if(inLobby){ //Leave lobby
            setGameId(null);
            setGameKey("");
            setChosenGameKey('');
            setInputGameId('');
            setInputGameKey('');

            setInLobby(false);
            return;
        }
        setGameId(inputGameId);
        setGameKey(inputGameKey);
    }

    async function submitGameCreate(){
        if(!inLobby){

            const payload = await callSupabase("POST", tableName, undefined, undefined, chosenGameKey);
            //console.log(payload);
            if(payload.data){
                const data = payload.data as PostReturn;
                setGameId(data.id.toString());
                setGameKey(data.key);

                //For visual sidebar purposes
                setInputGameId(data.id.toString());
                setInputGameKey(data.key);
            }
        }
    }

    function handleCreate(event:any){
        event.preventDefault(); //Do not refresh the page
        submitGameCreate();
    }

    return (
        <div className="sidebar" style={{display:"flex", flexDirection:"row", backgroundColor:"darkgrey"}}>
            {/* sidebar flexbox*/}
            <div className="sidebarContents" style={{flex:"1", display:sidebar==true?"flex":"none", flexDirection:"column", alignItems:"stretch"}}>
            {/*<TextInput boxLabel="Lobby Code:" inputText={inputText} buttonLabel="Submit" setInputText={setInputText} handleSubmit={ handleSubmit }/>*/}

            {/*Game ID / Key submission form*/}
            <form onSubmit={handleJoin} style={{display:'flex', flexDirection:'column', padding: '20px', fontFamily: 'Arial, sans-serif'}}>
                <div className="displayGrouping" style={{display:'flex', flexDirection:"row"}}>
                <label htmlFor="textInput" style={{ marginRight: '10px', alignContent:'center', fontWeight:'bold'}}>
                    Game ID
                </label>
                <input
                    type="text"
                    id="textInput"
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
                <div className="displayGrouping" style={{display:'flex', flexDirection:"row", marginTop:'3px'}}>
                <label htmlFor="textInput" style={{ marginRight: '10px', alignContent:'center', fontWeight:'bold'}}>
                    Game Key
                </label>
                <input
                    type="text"
                    id="textInput"
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
                style={{
                    alignSelf:'stretch',
                    marginTop: '5px',
                    backgroundColor: '#0070f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
                >
                {inLobby ? 'Leave Game' : 'Join Game' }
                </button>
            </form>

            <span style={{height:"2px",width:"100%", backgroundColor:"lightGrey", display:inLobby?'none':''}}></span>

            <form onSubmit={handleCreate} style={{display: inLobby?'none':'flex', flexDirection:'column', padding: '20px', fontFamily: 'Arial, sans-serif'}}>
                <div className="displayGrouping" style={{display:'flex', flexDirection:"row"}}>
                <label htmlFor="textInput" style={{ marginRight: '10px', alignContent:'center', fontWeight:'bold'}}>
                    Game Key
                </label>
                <input
                    type="text"
                    placeholder="Optional"
                    id="textInput"
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
                style={{
                    alignSelf:'stretch',
                    marginTop: '5px',
                    backgroundColor: '#0070f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
                >
                Create Game
                </button>
            </form>

            <span style={{height:"2px",width:"100%", backgroundColor:"lightGrey"}}></span>
            
            {/* Width = 0, minWidth = 100%  (or contain:"size") ensures that this box does not contribute to the size of the sidebar, and instead matches what is forced by the other children. */}
            <div className="secondBox" style={{padding:"5%", contain:"size" }}>
                <div style={{fontWeight:'bold'}}>Joining a game:</div>
                <span>Enter the Game ID, and the Game Key if it requires one, then click [Join Game]. If you do not have a required Game Key, you will join in spectate-only. </span>
                <div  style={{marginTop:'15px', fontWeight:'bold'}}>Creating a game:</div>
                <span>Enter a Game Key of your choosing, which you will share with others, then click [Create Game]. If no Game Key is entered, the game will be open to all.</span>
                <div  style={{marginTop:'15px', fontWeight:'bold'}}>Additionally:</div>
                <span style={{marginTop:'20px'}}>Game IDs {'[1 -> 5]'} are public lobbies. </span>
                <div style={{marginTop:'20px'}}>You will need to be logged into a non-anonymous account to create a game. </div>
                
            </div>

            </div>
            <span className="sidebarEdge" style={{backgroundColor:"grey"}}>
            <button style={{padding:"3px"}} onClick={toggleSidebar}>{sidebar==true?"<<":">>"}</button>
            </span>
        </div>
    );
};